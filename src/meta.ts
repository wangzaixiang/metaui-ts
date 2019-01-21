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
    record: RecordMeta

    constructor(config: DataTypeConfig){
        this.type = config.type;
        this.maker = config.maker;  // TODO
        this.elementType = DataType.build(config.elementType);
        this.record = RecordMeta.build(config.record);
        // (config.record instanceof RecordMeta)? config.record : new RecordMeta(config.record); 
    }

    static build(config: DataTypeConfig | DataType): DataType {
        if(config == null) return null;
        else if(config instanceof DataType) return config;
        else return new DataType(config)
    }
} 

export interface DataTypeConfig {
    type?: Type 
    maker?: Function
    elementType?: DataTypeConfig | DataType
    record?: RecordConfig | RecordMeta
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
    datatype: DataType   // default converter from string to type

    widget: string
    
    fromString: (string)=>any
    toString: (any)=>string

    // text
    length: number
    maxLength: number
    minLength: number
    regexp: RegExp

    // number
    min: number
    max: number

    // date
    format: string

    // select model
    selectModel: SelectModel

    private justifyDataType(type: Function | DataType | DataTypeConfig): DataType {
        if(type == null)
            throw Error("type can't be null");
        if(type instanceof Function) {
            switch(type){
                case Number: return new DataType({type: Type.DECIMAL} );
                case String: return new DataType({type: Type.STRING} );
                case Boolean: return new DataType({type: Type.BOOL});
                case Date: return new DataType({type: Type.DATE});
                default:
                    throw new Error("unknown primitive datatype");
                    //fail("unknown primtive datatype");
            }
        }
        else if(type instanceof DataType) {
            return type;
        }
        else return new DataType(<DataTypeConfig>type)
    }

    constructor(config: FieldMetaConfig) {
        this.name = config.name;
        this.label = (config.label == null) ? this.name : config.label;
        this.placeholder = config.placeholder;
        this.length = config.length;

        // datatype
        if(config.type == null) 
            throw new Error(`type can't be null for field ${this.name}`);
        this.datatype = this.justifyDataType(config.type);

        // widget
        this.widget = config.widget;

        // selectModel
        this.selectModel = SelectModel.build(config.selectModel)
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
    type?: Function | DataType | DataTypeConfig   // default converter from string to type

    widget?: string
    
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
        if(config == null) throw new Error();
        this.name = config.name;
        this.label = (config.label == null) ? config.label : config.name;
        this.fields = config.fields.map((cfg)=>new FieldMeta(cfg));
    }

    static build(src: RecordConfig | RecordMeta): RecordMeta {
        if(src == null) return null;
        else if(src instanceof RecordMeta) return src
        else return new RecordMeta(src);
    }
}

export interface RecordConfig {
    name: string
    label?: string

    fields: FieldMetaConfig[]
    
}

export class SelectModel {
    items: any[]
    label: (any)=>string
    key: (any)=>any
    
    constructor(config: SelectModelConfig) {
        this.items = config.items;
        this.label = this.buildFunction(config.label, "label");
        this.key = this.buildFunction(config.key, "key");
    }

    buildFunction(f: string | ((any)=>string), def: string ) : ((any)=>string){
        if(f == null) f = def;
        if(f instanceof Function) {
            return f;
        }
        else {
            return (item)=>""+item[<string>f];
        }
    }

    static build(config: SelectModelConfig | SelectModel): SelectModel {
        if(config==null) return null;
        else if(config instanceof SelectModel) return config;
        else return new SelectModel(config);
    }
}
export interface SelectModelConfig {
    items: any[] //  maybe
    label?: string | ((any)=>string)
    key?: string | ((any)=>any)    
}

export interface PropertyChangeListener {
    (source: any, path:string, old: any, value: any): void
    owner?: PropertyListenable
    path?: string
}

export interface PropertyListenable {
    __addPropertyChangeListener: (path:String, listener: PropertyChangeListener)=>void
    __removePropertyChangeListener: (path: String, listener: PropertyChangeListener)=>void
}

export function enhancePlainObject(obj: any) {
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
        })
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