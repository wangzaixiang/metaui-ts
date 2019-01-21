import { LitElement, html, customElement, property, TemplateResult } from 'lit-element';
import {StyleInfo, styleMap} from 'lit-html/directives/style-map'
import {repeat} from 'lit-html/directives/repeat'
import { RecordMeta, FieldMeta, Type} from './meta';
import { MetaWidget } from './m2text';
import './m2text';
import { watch } from 'fs';


export interface PropertyChangeListener {
    (source: any, path:string, old: any, value: any): void
    owner?: PropertyListenable
    path?: string
}

export interface PropertyListenable {
    __addPropertyChangeListener: (path:String, listener: PropertyChangeListener)=>void
    __removePropertyChangeListener: (path: String, listener: PropertyChangeListener)=>void
}


class DataBindBase extends LitElement {

    listener: PropertyChangeListener = (owner, path, old, value)=> {
        if(old != value) this.requestUpdate();
    }

    watch(owner:any, path:string){
        DataBindBase.enhancePlainObject(owner);  // make sure owner watchable
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

    /**
     * { name: "foo", age: 10 } 
     * will be enhanced to
     * { __shadow: { 
     *      name: "foo", 
     *      age: 10, 
     *      __listeners: {
     *          name: [],
     *          age: []
     *      }
     *   },
     *   __addPropertyChangeListener: function(path, listener) {...}
     *   __removePropertyChangeListener: function(path, listener) {...}
     *   get name() {...} 
     *   set name(value){...}
     *   get age() { ... }
     *   set age(value) { ... }
     * } 
     * 
     * the enhanced object still enumerate only "name", "age", so JSON.stringify will be same of origin.
     */
    static enhancePlainObject(obj: any) {
        var shadowDesc = Object.getOwnPropertyDescriptor(obj, "__shadow");
        if(shadowDesc == null){
            Object.defineProperty(obj, "__shadow", {
                configurable: true,
                enumerable: false,
                writable: true,
                value: {
                    __listeners: {}
                },
            });
            shadowDesc = Object.getOwnPropertyDescriptor(obj, "__shadow");
            var shadow = shadowDesc.value;
    
            Object.defineProperty(obj, "__addPropertyChangeListener", {
                configurable: true,
                enumerable: false,
                writable: false,
                value: function(path, listener) {
                    listener.path = path;
                    listener.owner = obj;
                    if(shadow.__listeners[path] == null)
                        shadow.__listeners[path] = [listener];
                    else
                        shadow.__listeners[path].push(listener);
                }
            });
            Object.defineProperty(obj, "__removePropertyChangeListener", {
                configurable: true,
                enumerable: false,
                writable: false,
                value: function(path, listener) {
                    var array = shadow.__listeners[path];
                    var index = array.indexOf(listener);
                    if(index >= 0){
                        array.splice(index, 1);
                        listener.owner = null;
                        listener.path = null;
                    }
                    else throw new Error(`listener not found ${path}`)
                }
            });
        }
    
        var shadow = obj.__shadow;
        Object.getOwnPropertyNames(obj).forEach(name => {
            var pd = Object.getOwnPropertyDescriptor(obj, name);
    
            if(pd.value instanceof Function) return;
            if(pd == shadowDesc || pd.enumerable == false) return;
    
            if(pd.get == null && pd.set == null) {
                var pd2: PropertyDescriptor = {
                    configurable: false,
                    enumerable: true,
                    //writable: false,
                    get: ()=> shadow[name],
                    set: (v: any) => {
                        var old = shadow[name];
                        shadow[name] = v 
                        if(old != v){
                            var listeners = shadow.__listeners[name];
                            if(listeners != null) for(var idx in listeners) {
                                var listener = listeners[idx];
                                listener(obj, name, old, v);
                            }
                        }
                    }
                }
                shadowDesc.value[name] = pd.value;
                delete obj[name];
    
                Object.defineProperty(obj, name, pd2);
            }
        });
    };
    
    // TODO restorePlainObject
    

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

        var model = this.getModel();
        if(this.metadata == null && model != null) { // auto discover metadata
            var proto = Object.getPrototypeOf(model);
            if(proto != null && proto.constructor && proto.constructor.metadata) 
                this.metadata = proto.constructor.metadata;
        }

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
