```thrift

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
}
```

```typescript
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

@metadata(name: "TTaskRequest", label="任务请求体" )
class  TTaskRequest {
    pageRequest: base_model.TPageRequest,

    @metadata(name: "taskName", type: "string", label:"任务编号")
    taskName: string,

    @metadata(name: "taskId", type:"i32", optional:"true")
    taskId: i32

    @metadata(name:"taskType", type:"")
    taskType: TaskType

    static metadata = RecordMeta.buildRecord(TTaskRequest, ["pageRequest", "taskName", "taskId"])
}


```