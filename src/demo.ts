//import './M2Text'

import { LitElement, html, customElement, property } from 'lit-element';
import { FieldMeta } from './meta';

import {User, Address} from './user';
import  './layout';
import { userInfo } from 'os';

@customElement("demo-element")
class DemoElement extends LitElement {

    @property()
    user: User

    sex: string

    constructor() {
        super();
        var user = this.user = new User();

        user.name = "wangzx";
        user.age = 40;
        user.sex = 'M';
        user.email = "wangzaixiang@gmail.com";
        user.birthday = new Date(2018, 10, 20);
        
        var addr = user.address = new Address();
        addr.province = "湖北";
        addr.city = "武汉";
        addr.area = "硚口";
        addr.street = "硚口";
        addr.detail = "中山大道中1号";
    }

    render(){
        return html`<m2-record .owner=${this} path="user"></m2-record>
        `
    }

}

// 1. me.user.age = 10
// 2. me -> m2-record -> m2-field -> m2-input -> input
//                       watch owner[path] when it changed
