import {RecordMeta, FieldMeta, Type, SelectModel } from './meta';

export class User {
    name: string
    sex: string // M/F
    age: number
    birthday: Date
    email: string
    address: Address

    static metadata: RecordMeta
}

export class Address {
    province: string
    city: string
    area: string
    street: string
    detail: string
    default: boolean

    static metadata: RecordMeta
}

var sexModel = new SelectModel({
    items: [ {key: 'M', label: 'male'}, {key: 'F', label: 'female'} ]
});

Address.metadata = new RecordMeta({
    name: 'address',
    label: '联系地址',
    fields: [
        {
            name: 'province',
            type: String,
            label: '省'
        },
        {
            name: 'city',
            type: String,
            label: '市'
        },
        {
            name: 'area',
            type: String,
            label: '区'
        },
        {
            name: 'street',
            type: String,
            label: '街道'
        },
        {
            name: 'detail',
            type: String,
            label: '详细地址'
        },
        {
            name: 'default',
            type: Boolean,
            label: '是否缺省地址'
        }
    ]
})

User.metadata =  new RecordMeta ({
    name: 'user',
    label: '用户',

    fields: [
        {
            name: 'name',
            type: String,
            label: '姓名',
            maxLength: 10,
            required: true,
            placeholder: "请输入姓名"
        },
        {
            name: 'sex',
            type: String,
            widget: 'm2-select',
            label: '性别',
            selectModel: sexModel
        },
        {
            name: 'age',
            type: Number,
            label: '年龄',
            min: 0,
            max: 100
        },
        {
            name: 'birthday',
            type: Date,
            label: '出生日期'
        },
        {
            name: 'email',
            type: String,
            regexp: /\w+@\w\.com/,
            label: '电子邮件',
            length: 30
        },
        {
            name: 'address',
            label: '联系地址',
            type: {
                type: Type.RECORD,
                record: Address.metadata
            }
        }
    ]
});

/**
 * var user: User 
 * 
 * <m2-form meta=${userMeta} path="user"></m2-form>
 * 
 * this will generate a form for edit the user.
 * 
 * - name
 * - age
 * - birthday
 * - email
 * - address since it's a array, it will use an array editor support remove/insert/move up/move down operation
 * 
 */