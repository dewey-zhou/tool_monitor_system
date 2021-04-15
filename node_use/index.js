const { query } = require('express');
const express = require('express');
const app = express();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: '192.168.1.250',
    user: 'root',
    password: 'root',     // 改成你自己的密码
    database: 'djjk' ,  // 改成你的数据库名称
    dateStrings: true 
});

connection.connect();

// 下面是解决跨域请求问题
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
 });
//1.机台信息
app.get('/machine_info',function(req,res){
    // console.log('machine_info')
    let sql 
    if(req.query.machine_num){
        sql = 'select * from machine_info WHERE machine_num='+req.query.machine_num; 
        // console.log(sql)
    }else{
        sql = 'select * from machine_info'; 
    }
    
    connection.query(sql,function(err,result){
        if(err){
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        if(result == ''){
            console.log('无该数据')
            result =[{"machine_num":req.query.machine_num,"machine_type":'无','machine_class':'无'}]
        }
        res.json(result); 

    }); 
})  
//2.报警统计
app.get('/warming',function(req,res){
    // console.log('warming')
    let sql 
    if(req.query.machine_num){
        sql = "select DATE_FORMAT(time,'%Y%m') months,count(tool_num)  from warming WHERE machine_num="+req.query.machine_num+" group by months"
       
    }else{
        sql = "select DATE_FORMAT(time,'%Y%m') months,count(tool_num)  from warming WHERE machine_num=1 group by months"; 
    }
    connection.query(sql,function(err,result){
        if(err){
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }

            res.json(result); 

    }); 
})  
//3.状态监控
app.get('/tool_hp',function(req,res){
    // console.log('tool_hp')
    let sql 
    if(req.query.machine_num){
        sql = 'select * from tool_hp WHERE tool_num='+req.query.tool_num+' and machine_num='+req.query.machine_num; 
        // console.log(sql)
    }else{
        sql = 'select * from tool_hp WHERE machine_num=1 and tool_num=1'; 
    }
    
    connection.query(sql,function(err,result){
        if(err){
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        if(result == ''){
            console.log('无该数据')
            result=[{"hp":0,"tool_num":req.query.tool_num,"machine_num":req.query.machine_num,"time":'0000-00-00 00:00:00'}]
        }
            res.json(result); 

    }); 
}) 
//4，统计该机台有多少把刀 
app.get('/count_tool',function(req,res){
    // console.log('count_tool')
    let sql = 'select count(machine_num) from tool_info WHERE machine_num='+req.query.machine_num; 
  
    
    connection.query(sql,function(err,result){
        if(err){
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
     
            res.json(result); 

    }); 
})  
//4.获取1号机台最后一把刀的刀号并设为范围中的默认值
app.get('/fond_tool',function(req,res){
    // console.log('font_tool')
    let sql = 'select tool_num from tool_hp where machine_num=1 ORDER BY time desc limit 1'; 
    connection.query(sql,function(err,result){
        if(err){
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
            res.json(result);
    }); 
})  
//4.刀具信息
app.get('/tool_info',function(req,res){
    let sql 
    if(req.query.tool_num){
        sql = 'select * from tool_info WHERE tool_num='+req.query.tool_num+' and machine_num='+req.query.machine_num; 
        // console.log(sql)
    }else{
        sql = 'select * from tool_info'; 
    }
    
    connection.query(sql,function(err,result){
        if(err){
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        if(result == ''){
            console.log('无该数据')
            result =[{"tool_num":req.query.tool_num,"djgg":'无',"djpp":'无',"jgjs":'无',"machine_num":req.query.machine_num}]
        }
        
        res.json(result); 

    }); 
})  
// 4.异常刀号
app.get('/warm_tool',function(req,res){
    let sql = 'select * from warming where time >=CURRENT_TIMESTAMP-INTERVAL 10 MINUTE  ORDER BY time desc LIMIT 3'
    connection.query(sql,function(err,result){
        if(err){
            console.log('[SELECT ERROR] - ',err.message)
            return 
        }
        if(result ==''){
            console.log('无数据')
           
        }
        res.json(result)
    })
})
//5.设备负载

app.get('/load_data',function(req,res){
    // console.log('load_data')
    let sql 
    if(req.query.machine_num){
        sql = 'select * from load_data WHERE machine_num='+req.query.machine_num;
        // console.log(sql)
    }else{
        sql = 'select * from load_data WHERE machine_num=1'; 
    }
    connection.query(sql,function(err,result){
        if(err){
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        if(result == ''){
            console.log('无该数据')
            result =[{"data":'[0,0,0,0,0]',"time":'0000-00-00 00:00:00',"machine_num":req.query.machine_num}]
        }
        // console.log(result)
        res.json(result); 

        // console.log(result)
        // result内放的就是返回的数据，res是api传数据
        // 返回的数据需要转换成JSON格式
        
    }); 

})

//6.主轴振动
app.get('/vib_data',function(req,res){
    // console.log('vib_data')
    let sql 
    if(req.query.machine_num){
        sql = 'select * from vib_data WHERE machine_num='+req.query.machine_num;
        // console.log(sql)
    }else{
        sql = 'select * from vib_data WHERE machine_num=1'; 
    }
    connection.query(sql,function(err,result){
        if(err){
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        // result内放的就是返回的数据，res是api传数据
        // 返回的数据需要转换成JSON格式
        if(result == ''){
            console.log('无该数据')
            result =[{"data":'600,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',"time":'0000-00-00 00:00:00',"machine_num":req.query.machine_num}]
        }
        // console.log('res',result)
        // console.log('len',result[0].data.length)
        res.json(result); 

    }); 
})  






var server = app.listen(8081, '127.0.0.1', function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("地址为 http://%s:%s", host, port);
})
