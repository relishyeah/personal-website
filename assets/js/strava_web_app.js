function count_activities(data){
    var ret = {};
    for(var x = 0;x<data.length;x++){
        if (data[x]['type'] in ret){
            ret[data[x]['type']] += 1;
        }   else{
            ret[data[x]['type']] = 1;
        }
    }
    return ret;
}

function get_routes(data,acts){
    var ret = {};
    for(var x = 0;x<data.length;x++){
        if (data[x]['map']['summary_polyline'] != null){
        if (data[x]['type'] in ret){
            ret[data[x]['type']].push(data[x]['map']['summary_polyline']);
        }   else{
            ret[data[x]['type']] = [data[x]['map']['summary_polyline']];
        }} else if(!(data[x]['type'] in ret)) {
            ret[data[x]['type']] = [];
            console.log('test');
        }
    }
    return ret;
}

function set_opacity(l){
    var len = l.length;
    if (len<5){
        return 1
    } else if (len<10){
        return .6
    } else if(len<20){
        return .35
    } else{
        return .2
    }
}

function mtm(meters){
   return Math.floor(meters/1609);
}

function mtf(meters){
    return Math.floor(meters*3.281);
}
function sth(seconds){
    return Math.floor(seconds / 3600);
}
function getMonths(){
    var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
    var x = new Date().getMonth();
    return month.slice(x+1).concat(month.slice(0,x+1))
}

function getMonth(piece){
    //returns moth where the current month is the last index
    return (parseInt(piece['start_date'].slice(5,7),10) -1)
}
function oneYear(date,today){
    date = new Date(date);
    return (today - date) < 31556952000 ;
}

function getYear(data){
    var ret = {};
    var date = new Date();
    var new_month = new Date(date.getFullYear(), date.getMonth(), 1);

    for(var x = 0;x<data.length;x++){
        
        if(oneYear(data[x]['start_date'], new_month)){
            if (data[x]['type'] in ret){
                ret[data[x]['type']][getMonth(data[x])] += 1;
            }   else{
                ret[data[x]['type']] = [0,0,0,0,0,0,0,0,0,0,0,0];
                x--;
            }
        }   
    }
    var x = new Date().getMonth();

    for (var j = 0; j < Object.keys(ret).length;j++){
        ret[Object.keys(ret)[j]] = ret[Object.keys(ret)[j]].slice(x+1).concat(ret[Object.keys(ret)[j]].slice(0,x-1));
    }
    return ret;
}

function makeChart(data, colors){
    
    var working = getYear(data);
    var ret = []
    for (var i = 0;i<Object.keys(working).length;i++){
        var _name = Object.keys(working)[i];
        ret.push({
            label: _name,
            data:working[_name],
            backgroundColor: colors[i],
            type:'bar'
        })
    }
    return ret;
}




var message = window.location.href;

let re = /token=(.*)\?/;
let re2 = /id=(.*)/;

var id = re2.exec(message)[1];
var message = re.exec(message)[1];


const stats_link = 'https://www.strava.com/api/v3/athletes/'+ id +'/stats?access_token=' + message ;
fetch(stats_link)
.then((res) => res.json())
.then(function(data){
    var rides = '';
    var runs = '';
    var swims = ''; 
    if(data['all_ride_totals']['count']>0){
        rides += '<b>' + data['all_ride_totals']['count'].toString() + '</b>' + ' rides over ' + '<b>' + mtm(data['all_ride_totals']['distance']).toString() + '</b>' + ' miles, climbing ' + '<b>' + mtf(data['all_ride_totals']['elevation_gain']).toString() + '</b> feet in '+ '<b>' + sth(data['all_ride_totals']['moving_time']).toString() + '</b> hours';
    }
    
    if(data['all_run_totals']['count']>0){
        runs += '<b>' + data['all_run_totals']['count'].toString() + '</b>' + ' runs over ' + '<b>' + mtm(data['all_run_totals']['distance']).toString() + '</b>' + ' miles, climbing ' + '<b>' + mtf(data['all_run_totals']['elevation_gain']).toString() + '</b> feet in '+ '<b>' + sth(data['all_run_totals']['moving_time']).toString() + '</b> hours ';
    }
    if(data['all_swim_totals']['count']>0){
        swims += '<b>' + data['all_swim_totals']['count'].toString() + '</b>' + ' swims over ' + '<b>' + mtm(data['all_swim_totals']['distance']).toString() + '</b>' + ' miles in '+ '<b>' + sth(data['all_swim_totals']['moving_time']).toString() + '</b> hours ';
    }




    document.body.innerHTML = document.body.innerHTML.replace('Ride',rides);
    document.body.innerHTML = document.body.innerHTML.replace('Run',runs);
    document.body.innerHTML = document.body.innerHTML.replace('Swim',swims);
});


const activities_link = 'https://www.strava.com/api/v3/athlete/activities?access_token='+ message +'&per_page=200';
fetch(activities_link)
.then((res) => res.json())
.then(function(data){
    //Total number of activities
    document.body.innerHTML = document.body.innerHTML.replace('Loading...', '<b>'+(Object.keys(data).length.toString()+ '</b>' + " all-time total activities"));
    var acts = count_activities(data);



   var colors = ['#000000','#0000FF','#009900', '#FF5733', '#7933FF', '#E5C3D1', '#5B8117','#F00000, #AF0088','#0F77a0'];
    // And for a doughnut chart
    var myDoughnutChart = new Chart(document.getElementById('activities'), {
        type: 'doughnut',
        data: {
            datasets: [{
                backgroundColor: colors.slice(0,Object.values(acts).length),
                data: Object.values(acts)
        }],
            labels: Object.keys(acts)
        },options:
        {
            title: {
                display: true,
                text: 'Activity Distribution'
            }
    }
});
    //Add a mixed chart
    var mixedChart = new Chart(document.getElementById('overTime'), {
        type: 'bar',
        data: {
            datasets:makeChart(data,colors),
                labels: getMonths()
            
        },
        options: {
            title: {
                display: true,
                text: 'Activity Frequency Over Last 12 Months'
            },
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });



    var map = L.map('map-app').setView([37.5, -97.5], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    var color;
    var i = 0;
    var routes = get_routes(data);
    for (act_type in routes){
        color = colors[i];
        i++;
        var route = routes[act_type];
        var opac = set_opacity(route);
        for (var j=0;j<route.length;j++){
            var coordinates = L.Polyline.fromEncoded(route[j]).getLatLngs();
            L.polyline(coordinates,
                {
                    color:color,
                    weight:5,
                    opacity:opac,
                    lineJoin:'round'
                }
        
            ).addTo(map)
        }
        

    }




}



)


