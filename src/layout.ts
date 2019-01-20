import { LitElement, html, customElement, property } from 'lit-element';
import {StyleInfo, styleMap} from 'lit-html/directives/style-map'


@customElement("m2-field")
class M2Field extends LitElement {

    @property({reflect: true})
    label: string

    @property({reflect: true})
    flag: string

    @property({reflect: true})
    message: string

    displayStyle(msg: string) {
        return (msg && msg.trim().length>0) ? { } : { display: "none" };
    }

    render(){
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
              grid-area: label
          }
          #main {
              grid-area: main
          }
          #message {
              grid-area: message
          }
          #label
        </style>   
        <div id="label">${this.label}:</div>
        <div id="main">
            <input length=20 value="wangzx@gmail.com"></input>
            <span id="flag" style=${styleMap(this.displayStyle(this.flag))}>${this.flag}</span>
        </div>
        <div id="message" style=${styleMap(this.displayStyle(this.message))}>${this.message}</div>
        `
        return body;
    }
}

@customElement("m2-record")
class M2Record extends LitElement {

    render(){
        return html`
        <style>
          :host {
              display: flex;
              /*flex-direction: column; */
          }
        </style>
            <m2-field label="userName"></m2-field>
            <m2-field label="password"></m2-field>
            <m2-field label="email"></m2-field>
            <m2-field label="age"></m2-field>
        `;
    }
}