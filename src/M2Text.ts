import { FieldMeta } from './meta';

import { LitElement, html, customElement, property } from 'lit-element';
import { render } from 'lit-html';


// m2-text
// m2-date
// m2-datatime
// m2-picker -- support multi-picker
// m2-record
// m2-list

@customElement("m2-text")
class M2Text extends LitElement {

    @property()
    meta : FieldMeta

    @property()
    model: any

    @property()
    path: string

    getValue() { 
        return this.model[this.path];
    }

    setValue(value: any) {
        this.model[this.path] = value;
    } 

    getText(){
        return this.getValue(); // TODO convert to text
    }

    setText(str: string){
        this.setValue(str)  // TODO convert to meta.type
    }

    changeListener(e: Event){
        var input: HTMLInputElement = <HTMLInputElement>e.srcElement;
        console.info("changed:" + input.value)
        this.model[this.path] = input.value
    }

    // TODO support more features for metas such as number, date, regexp.
    render(){
        return html`<div>${this.model.label}:<input placeholder=${this.meta.placeholder} value=${this.model[this.path]} @change=${this.changeListener}></input></div>`
    }

} 