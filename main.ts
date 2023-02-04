import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { ResponseModal } from "responseModal";
import { calculateNextReview } from "utils";

// Remember to rename these classes and interfaces!

interface Settings {
	mySetting: string;
}

const DEFAULT_SETTINGS: Settings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();

		const ribbonIconEl = this.addRibbonIcon(
			"repeat",
			"Create Periodic Review",
			() => {
				this.updateReviewCicle();
			}
		);

		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "update-frontmatter",
			name: "Update Review Cicle",
			callback: () => {
				this.updateReviewCicle();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	updateReviewCicle() {
		const file = this.app.workspace.getActiveFile();

		if (!file) {
			return;
		}
		const frontMatter =
			this.app.metadataCache.getFileCache(file)?.frontmatter;

		if (!frontMatter || !frontMatter["last_review"]) {
			app.fileManager.processFrontMatter(file, (frontMatter) => {
				frontMatter["last_review"] = new Date().toISOString();
				frontMatter["next_review"] = calculateNextReview(
					0,
					new Date()
				).toISOString();
				frontMatter["review_count"] = 0;
			});

			return new Notice("This note is now on the review cicle!");
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

		containerEl.createEl("h2", { text: "Plugin Settings." });

		new Setting(containerEl)
			.setName("Config #1")
			.setDesc("API secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your API Key")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
