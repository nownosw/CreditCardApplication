var lastLimitstring;      
var allData;
var GraphData;

$(document).ready(function () {
    $("#expensegraphcontainer").css("display", "none");
    var t = $("#example").DataTable({
      pageLength: 6,
      searching: false,
      info: false,
      ordering: false,
      lengthChange: false,
      bPaginate: false,
      scrollY: "82.9%",
    });

    FetchAllData();
    for(let i=0;i<allData.length;i++){
      t.row.add([allData[i][1],allData[i][2],allData[i][3],allData[i][4],allData[i][5],allData[i][6],]).draw(false);
   }

   GetLastLimit();
   var lastLimitInt=parseInt(lastLimitstring);

   expensecard=document.getElementById("balance")
   expenselimitnav=document.getElementById("expenselimit")

   expensecard.textContent="$"+lastLimitInt
   expenselimitnav.textContent="Available Limit: $"+lastLimitInt

    var form = document.getElementById("myform");
    var t = $("#example").DataTable();
    form.addEventListener("submit", function (event) {
       event.preventDefault();
       var expensedate = document.getElementById("date").value;
       var amount = document.getElementById("amount").value;
       var expenseType = document.getElementById("expenseType").value;
       var card = document.getElementById("cards").value;
       var purpose=document.getElementById("purpose").value
       newamount=parseInt(amount)
       
       GetLastLimit();
       var lastLimitInt=parseInt(lastLimitstring);
       
       let difference=lastLimitInt-newamount;
       let diffString=difference.toString();
       
       var pData = {
          ExpenseType : expenseType,
         Date : expensedate,
         Amount : newamount,
         ExpensePurpose : purpose,
         Card : card,
         AvailableLimit: diffString
      }
      
      InsertDataIntoDb(pData);

      FetchAllData()

      t.clear().draw()
      
      for(let i=0;i<allData.length;i++){
         t.row.add([allData[i][1],allData[i][2],allData[i][3],allData[i][4],allData[i][5],allData[i][6],]).draw(false);
      }

      allData=undefined;

      expensecard=document.getElementById("balance")
      expenselimitnav=document.getElementById("expenselimit")

      expensecard.textContent="$"+diffString
      expenselimitnav.textContent="Available Limit: $"+diffString
   });

   function GetGraphData(){
      var settings = {
         "url": "https://localhost:44328/api/Home/FetchDataForGraph",
         "method": "GET",
         "async":false,
         "success":function(response){
            GraphData=response;
         },
         "timeout": 0,
       };
       
       $.ajax(settings).done(function (response) {
       });
    }

    function InsertDataIntoDb(pData) {
      var settings = {
         "url": "https://localhost:44328/api/Home/AddValues",
         "method": "POST",
         "async":false,
         "timeout": 0,
         "headers": {
           "Content-Type": "application/json"
         },
         "data": JSON.stringify(pData),
      };
       
       $.ajax(settings).done(function (response) {
       });
   }
   
   function GetLastLimit(){
      var settings = {
         "url": "https://localhost:44328/api/Home/FetchLastLimit",
         "method": "GET",
         "async":false,
         "success":function(response){
            lastLimitstring=response;
         },
         "timeout": 0,
       };
       
       $.ajax(settings).done(function (response) {
       });
   }

   function FetchAllData(){
      var settings = {
         "url": "https://localhost:44328/api/Home/FetchValues",
         "method": "GET",
         "timeout": 0,
         "async":false,
         "success":function(response){
            allData=response;
         }
       };
       
       $.ajax(settings).done(function (response) {
       });
   }

    var chart={
        zoomType:'x'
    }
    
    var title={
        text:'Total Expense Over The Years'
    }
    
    var xAxis={
        type:'datetime',
        minRange:14*24*3600000 //14 days
    }
    
    var yAxis={
        title:{
            text:'Expense'
        }
    }

    GetGraphData();

    var plotOptions = {
        area: {
           fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
              stops: [
                 [0, Highcharts.getOptions().colors[0]],
                 [1, Highcharts.Color(
                    Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
              ]
           },
           marker: {
              radius: 2
           },
           lineWidth: 1,
           states: {
              hover: {
                 lineWidth: 1
              }
           },
           threshold: null
        }
     };

     var series = [{
        type: 'area',
        name: 'Expense Report over The Years',
        pointInterval: 24 * 3600 * 1000,
        pointStart: Date.UTC(2022, 0, 1),
        data:
           myData()
        
     }];

     function myData(){

      for(let p=0;p<GraphData.length;p++){
         start=GraphData[p][0]
         let [a,b,c]=GraphData[p][0].split("-")
         let d=c+"-"+b+"-"+a
         let dateObject=new Date(d)
         GraphData[p][0]=dateObject
      }

      starting=GraphData[0][0]
      ending=GraphData[GraphData.length-1][0]
      
      var data=[]
      i=starting.getTime()
      dataCounter=0
      graphCounter=0

      while(i<ending.getTime()){
         if(i==GraphData[graphCounter][0].getTime()){
            data[dataCounter]=parseInt(GraphData[graphCounter][1])
            dataCounter+=1
            graphCounter+=1
         }else{
            data[dataCounter]=0
            dataCounter+=1
         }
         i+=24*3600000
      }
      return data
     }

     var json = {};
     json.chart = chart;
     json.title = title;
     json.xAxis = xAxis;
     json.yAxis = yAxis;  
     json.series = series;
     json.plotOptions = plotOptions;
     $('#expensegraphcontainer').highcharts(json);
  });

  function changeView(){
    var x=document.getElementById("datatablecontainer")
    var y=document.getElementById("expensegraphcontainer")
    var btn=document.getElementById("changeview")
    btn.textContent="View Data Table";
    if(x.style.display=="none"){
        x.style.display="block";
        y.style.display="none"
        btn.textContent="View Graph"
    }else{
        x.style.display="none";
        y.style.display="block"
    }
}

function NavbarFunction(){
   var navbar=document.getElementById("nav")
   var navbar1=document.getElementById("nav1")
   navbar.classList.toggle('show')
   navbar1.classList.toggle('show')
}