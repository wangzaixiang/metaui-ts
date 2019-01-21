import { LitElement, html, customElement, property, TemplateResult } from 'lit-element';
import {StyleInfo, styleMap} from 'lit-html/directives/style-map'
import {repeat} from 'lit-html/directives/repeat'
import { RecordMeta, FieldMeta, Type, PropertyChangeListener, enhancePlainObject } from './meta';
import { MetaWidget } from './m2text';
import './m2text';
import { watch } from 'fs';

class DataBindBase extends LitElement {

    listener: PropertyChangeListener = (owner, path, old, value)=> {
        if(old != value) this.requestUpdate();
    }

    watch(owner:any, path:string){
        enhancePlainObject(owner);  // make sure owner watchable
        var listener = this.listener;
        if(listener.owner === owner && listener.path == path) return;

        if(listener.owner != null && listener.owner.__removePropertyChangeListener) 
            listener.owner.__removePropertyChangeListener(listener.path, listener);

        if(owner && owner.__addPropertyChangeListener) {
            owner.__addPropertyChangeListener(path, listener);
            listener.owner = owner;
            listener.path = path;
        }
    }

}

@customElement("m2-field")
class M2Field extends DataBindBase {

    @property()
    metadata: FieldMeta

    @property()
    owner: any // owner.path

    @property()
    path: string

    @property({reflect: true})
    flag: string

    @property({reflect: true})
    message: string

    private displayStyle(msg: string) {
        return (msg && msg.trim().length>0) ? { } : { display: "none" };
    }

    private getModelValue(){
        return this.owner[this.path];   // TODO
    }

    private setModelValue(value: String){ // TODO process type convertion
        this.owner[this.path] = value;
    }

    private computeWidget(){
        if(this.metadata.widget != null) return this.metadata.widget;
        else if(this.metadata == null) return "m2-text";
        else switch(this.metadata.datatype.type) {
            case Type.BOOL: return "m2-boolean";
            case Type.DATE: return "m2-date"
            default: return "m2-text";
        }

    }

    render(){
        var label = this.metadata.label;

        this.watch(this.owner, this.path);

        // TODO make sure the widget support MetaWidget interface
        var widget = this.computeWidget();
        var main = <MetaWidget><unknown>document.createElement(widget);
        main.metadata = this.metadata;
        main.datatype = this.metadata.datatype;
        main.value = this.getModelValue();

        main.addEventListener("change", e => {
            var value = <string>main.value;
            this.setModelValue(value);
        });

        var body = html`
        <style>
          :host { 
            display: grid; 
            grid-template-areas:
                "label main"
                "label message";
            grid-template-columns: var(--label-width, 100px) var(--main-width, 200px);
          }
          #flag, #message { color: red; }
          #label {
              grid-area: label;
          }
          #main {
              grid-area: main
          }
          #message {
              grid-area: message
          }
          #label
        </style>   
        <div id="label">${label}:</div>
        <div id="main">
            ${main}
            <span id="flag" style=${styleMap(this.displayStyle(this.flag))}>${this.flag}</span>
        </div>
        <div id="message" style=${styleMap(this.displayStyle(this.message))}>${this.message}</div>
        `
        return body;
    }
}

@customElement("m2-record")
class M2Record extends DataBindBase {

    @property()
    metadata: RecordMeta

    @property()
    owner: any

    @property({reflect: true})
    path: string

    private getModel() {
        return this.owner[this.path];
    }

    private renderField(field: FieldMeta) : TemplateResult {
        switch(field.datatype.type) {
            case Type.STRING:
            case Type.INT:
            case Type.DECIMAL:
            case Type.BOOL:
            case Type.DATE:
            case Type.DATETIME:
                return html`<m2-field id="f_${field.name}" .metadata=${field} .owner=${this.getModel()} .path=${field.name}></m2-field>`;
            case Type.RECORD:
                return html`<m2-record id="f_${field.name}" .metadata=${field.datatype.record} .owner=${this.getModel()} .path=${field.name}></m2-record>`;
            default:
                return html`<div>unknown datatype: ${field.datatype.type} for ${field.name}</div>`
        }
        return null
    }

    render(){
        this.watch(this.owner, this.path);

        return html`
        <style>
          :host {
              display: flex;
              flex-wrap: wrap;
          }
        </style>
        ${repeat( this.metadata.fields, 
            (field)=>field.name, 
            (field)=> this.renderField(field)
          ) 
        }
        `;
    }
}
