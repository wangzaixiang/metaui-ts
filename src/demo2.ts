import {metadata, RecordMeta, EnumMeta} from  "./meta"

/*
enum TaskType {
    BUG = 1,
    REQ = 2,
    TASK = 3,
    SUBTASK = 4
}

struct TTaskRequest {
    1: base_model.TPageRequest pageRequest,

    2: optional string taskName(m.label="任务编号",m.x="y"),

    3: optional i32 taskId(m.visible="false")
}(m.label="任务请求体")

service TaskAdminServcice{
    void deleteTask(i32 taskId(m.lbael="任务Id"))
      (m.name="删除任务")
}*/

type i8 = number
type i16 = number
type i32 = number
type i64 = string
type date = number
type datetime = number

enum TaskType {
    BUG = 1,
    REQ = 2,
    TASK = 3,
    SUBTASK = 4
}

var TaskType_meta : EnumMeta = {
    name: "TaskType",
    dictionary: [ 
        {label: "BUG", value: 1},
        {label: "REQ", value: 2},
        {label: "TASK", value: 3},
        {label: "SUBTASK", value: 4}
    ]
}

// TODO?
class TPageRequest {

    static metadata: RecordMeta
}

@metadata({name: "TTaskRequest", label:"任务请求体" })
class  TTaskRequest {
    @metadata({name: "pageRequest", type: TPageRequest.metadata})
    pageRequest: TPageRequest

    @metadata({name: "taskName", type: "string", label:"任务编号", "no":2, x: "y"})
    taskName: string

    @metadata({_name: "taskId", _type:"i32", _optional:"true", visible: "false"})
    taskId: i32

    @metadata({name:"taskType", type: TaskType_meta })
    taskType: TaskType

    static metadata = RecordMeta.buildRecord(TTaskRequest, ["pageRequest", "taskName", "taskId"])
}

class TTaskResponse {

}

class TaskAdminServcice {

    @metadata({name: "deleteTask", response: TTaskResponse})
    deleteTask(url: string, request: TTaskRequest) : Promise<TTaskResponse> {
        // val resp = fetch.doPost(JSON.stringify(request));    // the method should support JSON request
        // new TTaskResponse(resp);
        return null;
    }

}


    // <m2-method metadata=${TaskAdminService.deleteTask} request=${this.request} response=${this.response}></m2-method>
    // <m2-record metadata=${TTaskRequest.metadata}></m2-record>

// try to find 
// Reflect.getMetadata("metadata", TaskAdminServcice.prototype)