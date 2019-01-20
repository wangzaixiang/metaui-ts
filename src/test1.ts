import "reflect-metadata";

const formatMetadataKey = Symbol("format");

function format(formatString: string) {
    return Reflect.metadata(formatMetadataKey, formatString);
}

function getFormat(target: any, propertyKey: string) {
    return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}

function info(f: Function){
}

class User {
    
    name: string
    age: number
    birthday: Date

    email: string
    address: Address[]

}

class Address {
    province: string
    city: string
    area: string
    street: string
    detail: string
    default: boolean
}

@info
class Greeter {
    @format("Hello, %s")
    greeting: string;

    id = 1

    constructor(message: string) {
        this.greeting = message;
    }
    greet() {
        let formatString = getFormat(this, "greeting");
        return formatString.replace("%s", this.greeting);
    }
}

function test(){
    var greeter = new Greeter("wangzx");
    console.info(greeter.greet());
}

test();