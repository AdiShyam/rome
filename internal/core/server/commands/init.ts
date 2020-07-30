import {createServerCommand} from "@internal/core/server/commands";
import {commandCategories} from "@internal/core/common/commands";
import {Markup, markup} from "@internal/markup";
import {ServerRequest} from "@internal/core";
import {ExtensionHandler} from "@internal/core/common/file-handlers/types";
import {dedent} from "@internal/string-utils";
import {createDirectory, exists, writeFile} from "@internal/fs";
import {JSONObject, stringifyRJSON} from "@internal/codec-json";
import {getFileHandlerFromPath} from "@internal/core/common/file-handlers";
import Linter from "../linter/Linter";
import {PROJECT_CONFIG_DIRECTORY, ProjectDefinition} from "@internal/project";
import {AbsoluteFilePathMap} from "@internal/path";
import {getVCSClient} from "@internal/vcs";
import {
	Diagnostic,
	createSingleDiagnosticError,
	descriptions,
} from "@internal/diagnostics";

type Flags = {
	allowDirty: boolean;
};

export default createServerCommand<Flags>({
	category: commandCategories.PROCESS_MANAGEMENT,
	description: markup`initialise the project`,
	usage: "",
	examples: [],
	defineFlags(c) {
		return {
			allowDirty: c.get(
				"allowDirty",
				{
					description: markup`Allow running command with a dirty checkout`,
				},
			).asBoolean(false),
		};
	},
	async callback(req: ServerRequest, flags: Flags) {
		const {server, client, reporter} = req;
		const {cwd} = client.flags;

		// Check for sensitive directory
		if (server.projectManager.isBannedProjectPath(cwd)) {
			const diagnostic: Diagnostic = {
				description: descriptions.PROJECT_MANAGER.INITING_SENSITIVE(cwd),
				location: req.getDiagnosticLocationFromFlags("cwd"),
			};
			throw createSingleDiagnosticError(diagnostic);
		}

		// Check for no or dirty repo
		if (!flags.allowDirty) {
			const vcsClient = await getVCSClient(cwd);

			if (vcsClient === undefined) {
				throw createSingleDiagnosticError({
					location: req.getDiagnosticLocationFromFlags("cwd"),
					description: descriptions.INIT_COMMAND.EXPECTED_REPO,
				});
			} else {
				const uncommittedFiles = await vcsClient.getUncommittedFiles();
				if (uncommittedFiles.length > 0) {
					throw createSingleDiagnosticError({
						location: req.getDiagnosticLocationFromFlags("cwd"),
						description: descriptions.INIT_COMMAND.UNCOMMITTED_CHANGES,
					});
				}
			}
		}

		// Don't allow if we're already in a project
		const existingProject = await server.projectManager.findProject(cwd);
		if (existingProject !== undefined) {
			reporter.error(
				markup`Project already exists. Defined at <emphasis>${existingProject.meta.configPath}</emphasis>`,
			);
			reporter.info(
				markup`Use <code>rome config</code> to update an existing config`,
			);
			return;
		}

		reporter.heading(markup`Welcome to Rome! Let's get you started...`);

		const configPath = cwd.append(PROJECT_CONFIG_DIRECTORY, "rome.rjson");

		// Track some information about our project generation
		let savedCheckFiles = 0;
		let remainingCheckErrors = 0;
		const files: AbsoluteFilePathMap<Markup> = new AbsoluteFilePathMap();
		files.set(
			configPath,
			markup`Your project configuration. Documentation: <hyperlink target="https://romefrontend.dev/docs/project-config/" />`,
		);

		// We are only using JSONObject here because we don't have an accurate type definition for what
		// the config actually looks like on disk
		let config: JSONObject = {
			name: cwd.getBasename(),
		};

		// Ensure project is evicted and recreated properly
		let project: undefined | ProjectDefinition;
		async function updateConfig(partial: JSONObject = {}) {
			// Evict the project
			if (project !== undefined) {
				await server.projectManager.evictProject(project);
			}

			// Update it on disk
			config = {
				...config,
				...partial,
			};
			await writeFile(configPath, stringifyRJSON(config));

			// Add it again
			project = await server.projectManager.assertProject(cwd);
		}

		// Create initial project config
		await createDirectory(configPath.getParent());
		await updateConfig();

		// Generate files
		await reporter.steps([
			{
				message: markup`Generating lint config and apply formatting`,
				async callback() {
					const linter = new Linter(
						req,
						{
							apply: true,
						},
					);
					const {printer, savedCount} = await linter.runSingle();
					savedCheckFiles = savedCount;

					const globals: Array<string> = [];
					for (const diag of printer.processor.getDiagnostics()) {
						if (diag.description.category === "lint/js/undeclaredVariables") {
							if (diag.meta && diag.meta.identifierName) {
								globals.push(diag.meta.identifierName);
							}
						} else {
							remainingCheckErrors++;
						}
					}
					if (globals.length > 0) {
						await updateConfig({
							lint: {
								globals,
							},
						});
					}
				},
			},
			{
				message: markup`Generating .editorconfig`,
				async callback() {
					const editorConfigPath = cwd.append(".editorconfig");
					if (await exists(editorConfigPath)) {
						reporter.warn(
							markup`<emphasis>${editorConfigPath}</emphasis> already exists`,
						);
						return;
					}

					await server.projectManager.assertProject(cwd);

					// Get unique handlers
					const uniqueHandlers: Map<string, ExtensionHandler> = new Map();
					for (const path of server.memoryFs.glob(cwd)) {
						const {handler} = getFileHandlerFromPath(path, undefined);
						if (handler !== undefined) {
							uniqueHandlers.set(handler.ext, handler);
						}
					}

					let editorConfigTabExtensions: Array<string> = [];
					let editorConfigSpaceExtensions: Array<string> = [];
					for (const [ext, handler] of uniqueHandlers) {
						if (handler.hasTabs) {
							editorConfigTabExtensions.push(`*${ext}`);
						} else {
							editorConfigSpaceExtensions.push(`*${ext}`);
						}
					}

					let editorConfigTemplate = dedent`
							[*]
							end_of_line = lf
							trim_trailing_whitespace = true
							insert_final_newline = true
							charset = utf-8
							indent_style = space
							indent_size = 2
						`;

					if (editorConfigTabExtensions.length > 0) {
						editorConfigTemplate += "\n\n";
						editorConfigTemplate += dedent`
								[{${editorConfigTabExtensions.join(", ")}}]
								end_of_line = lf
								trim_trailing_whitespace = true
								insert_final_newline = true
								charset = utf-8
								indent_style = tab
								indent_size = 2
							`;
					}

					if (editorConfigSpaceExtensions.length > 0) {
						editorConfigTemplate += "\n\n";
						editorConfigTemplate += dedent`
								[{${editorConfigSpaceExtensions.join(", ")}}]
								end_of_line = lf
								trim_trailing_whitespace = true
								insert_final_newline = true
								charset = utf-8
								indent_style = space
								indent_size = 2
							`;
					}

					files.set(
						editorConfigPath,
						markup`Sets editor formatting and indentation options. Documentation: <hyperlink target="https://editorconfig.org/" />`,
					);
					await writeFile(editorConfigPath, editorConfigTemplate);
				},
			},
		]);

		await reporter.section(
			markup`Summary`,
			async () => {
				if (savedCheckFiles > 0) {
					reporter.info(
						markup`<emphasis>${savedCheckFiles}</emphasis> <grammarNumber plural="files" singular="file">${String(
							savedCheckFiles,
						)}</grammarNumber> saved`,
					);
				}
				if (remainingCheckErrors === 0) {
					reporter.success(markup`No problems found!`);
				} else {
					reporter.warn(
						markup`<emphasis>${remainingCheckErrors}</emphasis> errors remaining. Run <code>rome check</code> to view.`,
					);
				}
				reporter.br();
			},
		);

		await reporter.section(
			markup`Files created`,
			async () => {
				reporter.list(
					Array.from(
						files,
						([path, purpose]) =>
							markup`<emphasis>${path}</emphasis>: ${purpose}`
						,
					),
				);
			},
		);

		await reporter.section(
			markup`What next?`,
			() => {
				reporter.list(
					[
						markup`<emphasis>Setup an editor extension</emphasis>\nGet live errors as you type and format when you save. Learn more: <hyperlink target="https://romefrontend.dev/docs/editor-integration/" />`,
						markup`<emphasis>Try a command</emphasis>\n<code>rome check</code> is used to validate your code, verify formatting, and check for lint errors. Run <code>rome --help</code> for a full list of commands and flags.`,
						markup`<emphasis>Read documentation</emphasis>\nOur website serves as a comprehensive source of guides and documentation <hyperlink target="https://romefrontend.dev/" />`,
						markup`<emphasis>Get involved in the community</emphasis>\nAsk questions, get support, or contribute by participating on GitHub (<hyperlink target="https://github.com/romefrontend/rome"/>) or our community Discord (<hyperlink target="https://discord.gg/rome" />)`,
					],
					{
						ordered: true,
						pad: true,
					},
				);
				reporter.br();
			},
		);

		return true;
	},
});