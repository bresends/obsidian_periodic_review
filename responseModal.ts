import {
    App, Modal, Setting
} from "obsidian";

export class ResponseModal extends Modal {
	result: boolean;
	onSubmit: (result: boolean) => void;

	constructor(app: App, onSubmit: (result: boolean) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "Nota revisada com aproveitamento?" });
		contentEl.createEl("p", {
			text: "Esta nota está em sua memória ativa? O conteúdo está claro?",
		});

		new Setting(contentEl)
			.addButton((btn) =>
				btn.setButtonText("Cancelar").onClick(() => {
					this.close();
					this.onSubmit(false);
				})
			)
			.addButton((btn) =>
				btn
					.setButtonText("Confirmar")
					.setCta()
					.onClick(() => {
						this.close();
						this.onSubmit(true);
					})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
