import {
	App,
	Editor,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { ResponseModal } from "responseModal";
import { calculateNextReview } from "utils";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a great notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "update-frontmatter",
			name: "Update Frontmatter Review Cicle",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const file = this.app.workspace.getActiveFile();

				if (!file) {
					return;
				}
				const frontMatter =
					this.app.metadataCache.getFileCache(file)?.frontmatter;

				if (!frontMatter) {
					const oldText = editor.getValue();

					editor.setValue(
						"---" +
							"\ncreated_at: " +
							new Date(file.stat.ctime).toISOString() +
							"\nlast_review: " +
							new Date().toISOString() +
							"\nnext_review: " +
							calculateNextReview(0, new Date()).toISOString() +
							"\nreview_count: 0" +
							"\n---\n" +
							oldText
					);

					new Notice("Esta nota entrou no ciclo de revisões!");

					return;
				}

				new ResponseModal(this.app, (result) => {
					if (!result) {
						return;
					}
					new Notice("Revisão Agendada com sucesso!");
					app.fileManager.processFrontMatter(file, (frontMatter) => {
						frontMatter["review_count"] += 1;
						frontMatter["last_review"] = new Date().toISOString();
						frontMatter["next_review"] = calculateNextReview(
							frontMatter["review_count"],
							new Date(frontMatter["last_review"])
						).toISOString();
					});
				}).open();
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) {
						new ResponseModal(this.app, (result) => {
							if (!result) {
								return;
							}
							new Notice("Revisão Agendada com sucesso!");
						}).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {
		new Notice("Unloading plugin!");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Configurações de Plugin." });

		new Setting(containerEl)
			.setName("Configuração #1")
			.setDesc("API secret")
			.addText((text) =>
				text
					.setPlaceholder("Entre com a API Key")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
