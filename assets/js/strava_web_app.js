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
        }}
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


var message = window.location.href;

let re = /token=(.*)/;
console.log(message)
var message = re.exec(message)[1];
console.log(message)


const activities_link = 'https://www.strava.com/api/v3/athlete/activities?access_token='+ message +'&per_page=200';
fetch(activities_link)
.then((res) => res.json())
.then(function(data){
    //Total number of activities
    document.body
    .innerHTML = document.body.innerHTML.replace('Loading...', (Object.keys(data).length.toString() + " total activities"));
    var acts = count_activities(data);
    console.log(acts);

   var colors = ['#000000','#0000FF','#009900', '#61210F', '#87B38D', '#E5C3D1', '#5B8117'];
    // And for a doughnut chart
    var myDoughnutChart = new Chart(document.getElementById('activities'), {
        type: 'doughnut',
        data: {
            datasets: [{
                backgroundColor: colors.slice(0,Object.values(acts).length),
                data: Object.values(acts)
        }],
            labels: Object.keys(acts)
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
        console.log(route.length);
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


