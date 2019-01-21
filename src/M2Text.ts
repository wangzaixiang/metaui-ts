import { FieldMeta, DataType, Type } from './meta';

import { LitElement, html, customElement, property, TemplateResult } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';



// m2-text
// m2-date
// m2-datatime
// m2-picker -- support multi-picker
// m2-record
// m2-list
/**
 *
 */
export interface MetaWidget extends HTMLElement {
    metadata: FieldMeta,
    datatype: DataType,  // 
    value: any
} 

/**
 * M2Text is a simple widget for edit a value.
 * show placeholder
 * 
 * most checks are done in m2-field
 */
@customElement("m2-text")
class M2Text extends LitElement implements MetaWidget {

    @property()
    metadata : FieldMeta

    @property({reflect: true})
    value: any  // must confirm to DataType

    datatype: DataType  // support only INT, DECIMAL, STRING

    private convertToString(value:any) {
        switch(typeof value){
            case "number":
                
            case "string":
            case "boolean":
                
        }
    }

    changeListener(e: Event){
        var input: HTMLInputElement = <HTMLInputElement>e.srcElement;
        var value = input.value;
        this.value = value;  // TODO
        
        var e2 = new Event("change", {bubbles:true});
        this.dispatchEvent(e2);
    }

    // TODO support more features for metas such as number, date, regexp.
    render(){
        return html`<input 
            placeholder=${this.metadata.placeholder} 
            value=${this.value}
            size=${this.metadata.length}
            @change=${this.changeListener}></input>
        `
    }

} 

@customElement("m2-boolean")
class M2Boolean extends LitElement implements MetaWidget {

    @property()
    metadata: FieldMeta

    @property()
    datatype: DataType; // support only Boolean

    @property()
    value: boolean;

    changeListener(e){
        this.value = (<HTMLInputElement>e.srcElement).checked;
        this.dispatchEvent(new Event("change", {bubbles: true}));
    }

    render(){
        return html`
            <input type="checkbox" ?checked=${this.value} @change=${this.changeListener}></input>
        `
    }
}

@customElement("m2-date")
class M2Date extends LitElement implements MetaWidget {
    @property()
    metadata: FieldMeta;
    
    @property()    
    datatype: DataType; 

    @property()
    value: Date | string;  // TODO support long as timestamp

    static FORMAT = new Intl.DateTimeFormat("zh-CN", {year:"numeric", month: "2-digit", day: "2-digit"})

    formatDate(value: Date | string){
        if(value == null) return "";
        if(value instanceof Date) 
            return M2Date.FORMAT.format(value).replace(/\//g, "-");
        else return value;
    }

    private stringToDate(_date:string,_format:string,_delimiter:string)
    {
            var formatLowerCase = _format.toLowerCase();
            var formatItems = formatLowerCase.split(_delimiter);
            var dateItems = _date.split(_delimiter);

            var monthIndex = formatItems.indexOf("mm");
            var dayIndex = formatItems.indexOf("dd");
            var yearIndex = formatItems.indexOf("yyyy");

            var month = parseInt(dateItems[monthIndex]);
            var year = parseInt(dateItems[yearIndex])
            var day = parseInt(dateItems[dayIndex]);
            
            var formatedDate = new Date(year,month-1,day);
            return formatedDate;
    }

    changeListener(e: Event){
        var element = <HTMLInputElement>e.srcElement;
        var value = element.value;
        switch(this.datatype.type){
            case Type.STRING:
                this.value = value;
                break;
            case Type.DATE:
                this.value = this.stringToDate(value, "yyyy-mm-dd", "-");
                break;
        }
        this.dispatchEvent(new Event("change", {bubbles: true}));
    }

    render(){
        return html`
        <input type="date" value=${this.formatDate(this.value)}
            @change=${this.changeListener}
        ></input>
        `
    }

}

@customElement("m2-select")
class M2Select extends LitElement implements MetaWidget{
   
    @property()
    metadata: FieldMeta;

    @property()
    datatype: DataType;

    @property()
    value: any;

    changeListener(e: Event){
        var elem = <HTMLSelectElement>e.srcElement;
        var value = elem.value;
        this.value = value;

        this.dispatchEvent(new Event("change", {bubbles: true}));
    }

    renderOption(key:string, label: string){
        var selected = key == this.value;   // TODO
        return html`<option ?selected=${selected} value=${key}>${label}</option>`
    }

    renderOptions() {
        var sm = this.metadata.selectModel;
        var options = repeat( this.metadata.selectModel.items, 
            (item, index)=> index,
            (item, index) => this.renderOption(sm.key(item), sm.label(item)) ); 
        return options;
    }

    render(){
        return html`
        <select @change=${this.changeListener}>
        ${this.renderOptions()}
        </select>
        `;
    }
}