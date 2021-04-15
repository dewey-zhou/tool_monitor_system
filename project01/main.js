import axios from 'axios'
import * as echarts from 'echarts';


//设备编号
var machine_num=document.getElementById("machine_num")

//监控范围模式
var model=document.getElementById("model")
model.addEventListener('change',selectModel)
//监控范围刀号
var tool=document.getElementById("tool")

selectMachine()
machine_num.addEventListener('change',selectMachine)
tool.addEventListener('change',selectTool)
//1.机台信息
function selectMachine(){
    // console.log(machine_num.selectedIndex)
    // console.log(machine_num.value)
    
    axios.get("http://127.0.0.1:8081/machine_info",{params:{machine_num:machine_num.value}})
    .then(function(res){
        let message= res.data
     
        document.getElementById("device_type").innerText = message[0].machine_type
       document.getElementById("device_class").innerText = message[0].machine_class
   })
   CountTool()
   Machine_vib()
   Machine_load()
   toolWarmingCount()
   warmTool()
}
var myChart1
//2.刀具历史报警统计
function toolWarmingCount(){
    clearInterval(timer)
   
    var timer =setInterval(update_data,1000)
    function update_data(){
        axios.get("http://127.0.0.1:8081/warming",{params:{machine_num:machine_num.value}})
    .then(function(res){
        let warmingTime=[]
        let warmingData=[]
        for(var i=0;i<res.data.length;i++){
            warmingTime.push(res.data[i].months)
            warmingData.push(res.data[i]['count(tool_num)'])
        }
        //清除 There is a chart instance already initialized on the dom 错误
        if (myChart1 != null && myChart1 != "" && myChart1 != undefined) {
            myChart1.dispose();//销毁
        }
        //画图
        myChart1 = echarts.init(document.getElementById('tab1'))
        window.addEventListener('resize',function () {//执行
            myChart1.resize();
        })
        let option;
        option = {
            animation: false,
            color: ['#c23531'],
            xAxis: {
                type: 'category',
                data: warmingTime
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: warmingData,
                type: 'bar'
            }],
            tooltip : {
                trigger: 'axis',
                axisPointer: {
                    animation: false
                }
            }
        };
        
        option && myChart1.setOption(option);
    })
    } 
}
var myChart2
var dataList=[]
var dataTime=[]
var oldLength=0
//3.刀具实时状态监控
function toolHp(){
    clearInterval(timer3)
    axios.get("http://127.0.0.1:8081/tool_hp",{params:{machine_num:machine_num.value,tool_num:tool.value}})
        .then(function(res){
            oldLength = res.data.length
            for(var i=0;i<oldLength;i++){
                dataList.push(res.data[i].hp)
                dataTime.push(res.data[i].time)
            }
            if (myChart2 != null && myChart2 != "" && myChart2 != undefined) {
                myChart2.dispose();//销毁
            }
                
                myChart2 = echarts.init(document.getElementById('tab2'))
                window.addEventListener('resize',function () {//执行
                    myChart2.resize();
                })
                let option;
                option = {
                    animation:false,
                    dataZoom: {
                        show: true,
                        realtime: true,
                        y: 36,
                        height: 20,
                        startValue: dataTime.length-1000,
                        endValue: dataTime.length-1
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: dataTime,
                        axisLabel: {
                            showMaxLabel: true
                          }
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel:{
                            formatter: function(value){
                                return (value*100).toFixed(2)+'%'
                              }
                        }
                    },
                    series: [{
                        data: dataList,
                        symbol:'circle',
                        symbolSize: 8,
                        showSymbol: false,
                        type: 'line',
                        smooth:true,
                        areaStyle: {},
                        itemStyle: {  
                            normal: { //颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1,[{
                                        offset: 0, color: '#81befd' // 0% 处的颜色
                                    }, {
                                        offset: 0.4, color: '#e4f2ff' // 100% 处的颜色
                                    }, {
                                        offset: 1, color: '#fff' // 100% 处的颜色
                                    }]
                                ), //背景渐变色    
                                lineStyle: {        // 系列级个性化折线样式  
                                    width: 3,  
                                    type: 'solid',  
                                    color: "#0180ff" //折线的颜色
                                }  
                            },  
                            emphasis: {
                                color: '#0180ff',   
                                lineStyle: {        // 系列级个性化折线样式  
                                    width: 2,  
                                    type: 'dotted',  
                                    color: "0180ff" 
                                }  
                            }  
                        }//线条样式
                    }],
                    tooltip : {
                        trigger: 'axis',
                        axisPointer: {
                            animation: false
                        },
                        axisLabel:{
                            formatter: function(value){
                                return (value*100).toFixed(2)+'%'
                              }
                        }
                    }
                };
                option && myChart2.setOption(option);
        })
    var timer3 =setInterval(update_data,1000)
    function update_data(){
        axios.get("http://127.0.0.1:8081/tool_hp",{params:{machine_num:machine_num.value,tool_num:tool.value}})
        .then(function(res){
            // console.log('data',res.data[0])
            
            if(dataTime[dataTime.length-1]!==res.data[res.data.length-1].time){
                // console.log('更新前',dataTime[dataTime.length-1])
                dataTime.shift()
                dataTime.push(res.data[res.data.length-1].time)
                dataList.shift()
                dataList.push(res.data[res.data.length-1].hp)

                myChart2.setOption({
                    xAxis: {
                        data: dataTime,
                    },
                    series:[{
                        data: dataList
                    }]
                })
                
                // console.log('更新后',dataTime[dataTime.length-1])
            }   
        })
        

        // console.log('更新后',dataTime)
       
    }
}

//4。异常刀号
function warmTool(){
    axios.get("http://127.0.0.1:8081/warm_tool")
    .then(function(res){
        console.log(res.data)
        let state = document.getElementById('state')
        let warmData = document.getElementById('warmData')
        warmData.innerHTML=''
        if(res.data==''){
            state.innerHTML='<span>正常</span>'
            state.style='border: 1px solid green;'
            warmData.innerHTML =' <tr><td class="table-none" colspan="2">暂无数据</td></tr>'
            return
        }
        state.innerHTML='<span>异常</span>'
        state.style='border: 1px solid red;'
        let frag = document.createDocumentFragment()
        for(let i =0 ;i<res.data.length;i++){
            let tr  =document.createElement('tr')
            tr.innerHTML = ` <td>${res.data[i].machine_num}</td><td>${res.data[i].tool_num}</td>`
            frag.appendChild(tr)
        }
        warmData.appendChild(frag)
       
    })
}
//4.确定某机台的刀号数量及默认值
function CountTool(){
    axios.get("http://127.0.0.1:8081/count_tool",{params:{machine_num:machine_num.value}})
    .then(function(res){
        let message= res.data
     
        let length =message[0]['count(machine_num)']
        let frag = document.createDocumentFragment()
        for(let i =0;i<length;i++){
            let option = document.createElement('option')
            option.innerHTML = i+1
            option.value=i+1
            
            frag.appendChild(option)
        }
        tool.innerHTML=''
        tool.appendChild(frag)
        axios.get("http://127.0.0.1:8081/fond_tool").then(function(res){
            tool[res.data[0].tool_num-1].selected =true
            selectTool()
        })
        toolHp()
        
   })
}
//4.刀具信息
function selectTool(){
    // console.log(tool.selectedIndex)
    // console.log(tool.value)
    axios.get("http://127.0.0.1:8081/tool_info",{params:{tool_num:tool.value,machine_num:machine_num.value}})
    .then(function(res){
        let message= res.data
        // console.log('4.刀具信息',res.data)
        document.getElementById("tool_number").innerText = message[0].tool_num
       document.getElementById("tool_type").innerText = message[0].djgg
       document.getElementById("tool_brand").innerText = message[0].djpp
       document.getElementById("process_number").innerText = message[0].jgjs
       
   })
}
function selectModel(){
    //默认是自动   
    // console.log('model',model.selectedIndex)
    // console.log(model.value)

}
var myChart3
//5.设备负载
function Machine_load(){
    clearInterval(timer)
    
    var dataTime=[]
    var machineData =[]
    var timer =setInterval(update_data,1000)
    var i=0
    //清除 There is a chart instance already initialized on the dom 错误
    
    function update_data(){
        axios.get("http://127.0.0.1:8081/load_data",{params:{machine_num:machine_num.value}}
        // {params:{time:timing}}
        )
        .then(function(res){
            let message= res.data
            let dataingData =JSON.parse(message[0].data)
            let dataingTime = new Array(dataingData.length).fill('')
            dataingTime[dataingTime.length-1]=message[0].time.slice(11,20)
            dataTime.push(...dataingTime)
            machineData.push(...dataingData) 
            //画图
            //清除 There is a chart instance already initialized on the dom 错误
            if (myChart3 != null && myChart3 != "" && myChart3 != undefined) {
                myChart3.dispose();//销毁
            }
            myChart3 = echarts.init(document.getElementById('tab3'))
           
            window.addEventListener('resize',function () {//执行
                myChart3.resize();
            })
            let option;
            
            option = {
                
                animation: false,
                xAxis: {
                    type: 'category',
                    data: dataTime,
                    "axisLabel":{
                        interval: 0
                    }
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    symbol:'circle',
                    symbolSize: 8,
                    showSymbol: false,
                    data: machineData,
                    type: 'line',
                    smooth:true
    
                }],
                tooltip : {
                    trigger: 'axis',
                    axisPointer: {
                        animation: true
                    }
                }
            };
            myChart3.setOption(option);
            if(dataTime.length>35){
                dataTime=dataTime.slice(dataingData.length)
                machineData=machineData.slice(dataingData.length)
            }
            
    
       })
    }
}
var myChart4
//6.主轴振动
function Machine_vib(){
    var dataTime=[]
    var machineData =[]
    var timer =setInterval(update_data,1000)
    var i=0
   
    function update_data(){
        axios.get("http://127.0.0.1:8081/vib_data",{params:{machine_num:machine_num.value}}
        )
        .then(function(res){
           
            let message= res.data
            
            let dataingData =JSON.parse('['+message[0].data+']').slice(1,61)
            
    
            
            let dataingTime = new Array(dataingData.length).fill('')
            
         
            dataingTime[dataingTime.length-1]=message[0].time.slice(11,20)
            // console.log('datatime',dataingData)
            dataTime.push(...dataingTime)
           
            machineData.push(...dataingData) 
        

            //清除 There is a chart instance already initialized on the dom 错误
            if (myChart4 != null && myChart4 != "" && myChart4 != undefined) {
                myChart4.dispose();//销毁
            }
            //画图
            myChart4 = echarts.init(document.getElementById('tab4'))
            window.addEventListener('resize',function () {//执行
                myChart4.resize();
            })
            let option;
            
            option = {
                animation: false,
                xAxis: {
                    axisTick: {
                        show: false
                    },
                    type: 'category',
                    data: dataTime,
                    "axisLabel":{
                        interval: 0
                    }
                },
                yAxis: {
                    type: 'value',
                    min:-1000, //y轴的最小值
                    max:1000, //y轴最大值 
                    interval:200 //值之间的间隔
                },
                series: [{
                    symbol:'circle',
                    symbolSize: 8,
                    showSymbol: false,
                    data: machineData,
                    type: 'line',
                    smooth:true
    
                }],
                tooltip : {
                    trigger: 'axis',
                    axisPointer: {
                        animation: false
                    }
                }
            };
            myChart4.setOption(option);
            if(dataTime.length>120){
                dataTime=dataTime.slice(dataingData.length)
                machineData=machineData.slice(dataingData.length)
            }
            
    
       })
    }
}

