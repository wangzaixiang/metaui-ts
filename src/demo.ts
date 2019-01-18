import './M2Text'

import { LitElement, html, customElement, property } from 'lit-element';
import { FieldMeta } from './meta';

@customElement("demo-element")
class DemoElement extends LitElement {

    meta = new FieldMeta({
        name: "age",
        label: "年龄",
        type: Number,
        placeholder: '请输入年龄'
    })

    age = 10

    render(){
        return html`<p>Demo</p> <m2-text .meta=${this.meta} .model=${this} path="age"></m2-text>`
    }

}
