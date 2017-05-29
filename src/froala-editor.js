import { customElement, bindable, inject, inlineView } from 'aurelia-framework';
import { ObserverLocator } from "aurelia-binding";
import { I18N } from "aurelia-i18n";
import { EventAggregator } from 'aurelia-event-aggregator';

customElement('froala-editor')
@inlineView('<template><div ref="editorDiv"></div></template>')
@inject(Element, I18N, EventAggregator)
export class FroalaEditor {
	@bindable value;
	@bindable config = {}
	@bindable eventHandlers = {}

	element;
	instance;
	i18n;
	i18nInitialized = false;

	constructor(element, observerLocator, i18n, eventAggregator) {
		this.element = element;
		this.i18n = i18n;
		eventAggregator.subscribe('i18n:locale:changed', payload => {
			this.processLanguageChanged();
		});
	}

	processLanguageChanged() {
		this.tearDownFroala();
		this.setupFroala();
	}

	valueChanged(newValue) {
		if (this.instance && this.instance.froalaEditor('html.get') != newValue) {
			this.instance.froalaEditor('html.set', newValue);
			this.updateEmptyStatus();
		}
	}


	setupFroala() {
		this.instance = $(this.editorDiv);

		if (this.instance.data('froala.editor')) {
			return;
		}
		let c = {}
		c.language = this.i18n.getLocale();
		Object.assign(c, this.config);
		this.instance.froalaEditor(c);
		this.instance.froalaEditor('html.set', this.value);
		if (this.eventHandlers && this.eventHandlers.length != 0) {
			for (let eventHandlerName in this.eventHandlers) {
				let handler = this.eventHandlers[eventHandlerName];
				this.instance.on(`froalaEditor.${eventHandlerName}`, function () {
					let p = arguments;
					return handler.apply(this, p)
				});

			}
		}
		this.instance.on('froalaEditor.contentChanged,froalaEditor.blur', (e, editor) => this.value = editor.html.get());
	}

	updateEmptyStatus() {

	}

	tearDownFroala() {
		if (this.instance && this.instance.data('froala.editor')) {
			this.instance.froalaEditor('destroy');
		}
		this.instance = null;
	}

	attached() {
		this.setupFroala();
	}

	detached() {
		this.tearDownFroala();
	}
}
