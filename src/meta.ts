
/**
 * primitive: number, string, date, datetime, boolean
 * collection: array of type
 * record: array of FieldMeta
 */

export enum Type {
     BOOL = 1,  // boolean
     INT = 2,   // number
     DECIMAL = 3,   // number
     STRING = 4,    // string  
     DATE = 5,      // date
     DATETIME = 6,  // date

     MAP = 20,      // Map<String, ?>
     LIST = 21,     // Array<?>
     RECORD = 22    //
 }

export class DataType {
    type: Type
    maker: Function    // constructor
    elementType: DataType  // for MAP, LIST
    fields: FieldMeta[]

    constructor(config: DataTypeConfig){

    }
} 

export interface DataTypeConfig {
    type?: Type 
    maker?: Function
    elementType?: DataTypeConfig | DataType
    fields?: FieldMeta[] | FieldMetaConfig[]
}

export class FieldMeta {
    name: string
    label: string
    required: boolean
    readonly: boolean
    prompt: string
    placeholder: string
    visible: boolean
    disable: boolean
    type: DataType   // default converter from string to type
    
    fromString: (string)=>any
    toString: (any)=>string

    // text
    length: number
    maxLength: number
    minLength: number
    regexp: string | RegExp

    // number
    min: number
    max: number

    // date
    format: string

    // select model
    selectModel: SelectModel

    constructor(config: FieldMetaConfig) {
        this.placeholder = config.placeholder;
    }
}
 

export interface FieldMetaConfig {
    name: string
    label?: string
    required?: boolean
    readonly?: boolean
    prompt?: string
    placeholder?: string
    visible?: boolean
    disable?: boolean
    type?: Function | Type | DataTypeConfig   // default converter from string to type
    
    fromString?: (string)=>any
    toString?: (any)=>string

    // text
    length?: number
    maxLength?: number
    minLength?: number
    regexp?: string | RegExp

    // number
    min?: number
    max?: number

    // date
    format?: string

    // select model
    selectModel?: SelectModel
}

export class RecordMeta {
    name: string
    label: string
    fields: FieldMeta[]

    constructor(config: RecordConfig) {

    }
}

export interface RecordConfig {
    name?: string
    label?: string

    fields: FieldMetaConfig[]
    
}

export class SelectModel {
    values: any[]
    label: string | ((any)=>string)
    value: string | ((any)=>any)
    
    constructor(config: SelectModelConfig) {

    }
}
export interface SelectModelConfig {
    values: any[]
    label?: string | ((any)=>string)
    value?: string | ((any)=>any)    
}

let ageMeta: FieldMeta = new FieldMeta({
    name: "age",
    label: "年龄"
})

var sexModel  = new SelectModel ( {
    values: [ {name: 'M', label: 'Male'}, {name: 'F', label: 'Female'} ],
    label : "label",
    value :  (value)=>value.name
})
