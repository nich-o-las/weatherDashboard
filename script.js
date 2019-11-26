$(function () {
    var openWeatherApiKey = "6f9d21949e418df303c9d9bb4b285a0f";
    var queryCity;
    var futureForecast = $('#futureForecast');
    var currentWeather = $('#currentWeather');
    var todayResult;

    var dayTemps = [[], [], [], [], []];

    $('#submit-btn').click(function (e) {
        e.preventDefault();
        futureForecast.empty();
        currentWeather.empty();
        queryCity = $('#cityName').val().trim();
        console.log(queryCity);
        currentWeatherCall();
    });
    $("#cityList").on('click', '.btn', function(e){
        e.preventDefault();
        futureForecast.empty();
        currentWeather.empty();
        queryCity = $(this).text();
        console.log(queryCity);
        currentWeatherCall();
    });
    $("#cityName").on('keypress',function(e) {
        if(e.which == 13) {
            futureForecast.empty();
            currentWeather.empty();
            queryCity = $('#cityName').val().trim();
            console.log(queryCity);
            currentWeatherCall();
        }
    });

    function fiveDayCall() {
        var fiveDayURL = `https://api.openweathermap.org/data/2.5/forecast?q=${queryCity},us&appid=${openWeatherApiKey}`;
        $.ajax({
            url: fiveDayURL,
            success: function (result) {
                var daytemps = [[], [], [], [], []]
                console.log(fiveDayURL)
                var day = 0;
                var max = 0;
                var min = 1000;
                for (var i = 0; i < result.list.length; i++) {
                    if (i != 0 && i % 8 === 0) {
                        dayTemps[day].push(min, max);
                        day++;
                        max = 0;
                        min = 1000;
                    }
                    if (result.list[i].main.temp_max > max) {
                        max = result.list[i].main.temp_max;
                    }
                    if (result.list[i].main.temp_min < min) {
                        min = result.list[i].main.temp_min;
                    }
                }
                dayTemps[day].push(min, max);
                render();
            }
        });
    }

    function currentWeatherCall() {
        var currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${queryCity},us&appid=${openWeatherApiKey}`;
        $.ajax({
            url: currentWeatherUrl,
            success: function (result) {
                todayResult = result;
                fiveDayCall();
            }
        })
    }

    function render() {
        var min;
        var max;
        var hours = 0;
        // render the 5 day forecast
        dayTemps.forEach(function (day) {
            min = ((9 / 5) * (parseInt(day[0]) - 273.15) + 32).toFixed();
            max = ((9 / 5) * (parseInt(day[1]) - 273.15) + 32).toFixed();
            var hoursDiv = (`<div class="hoursDiv">${hours}-${hours + 24} hours from now</div>`)
            var futureDiv = $('<div class="futures col-lg-2 col-md-3 col-sm-4 col-xs-6 border">');
            var futureHigh = $(`<p class="futureHigh">high: ${max}<p>`);
            var futureLow = $(`<p class="futureLow">low: ${min}<p>`);
            futureDiv.append(hoursDiv, futureHigh, futureLow);
            futureForecast.append(futureDiv);
            hours += 24;
        })
        // render the current temperature
        var nowTemp = ((9 / 5) * (parseInt(todayResult.main.temp) - 273.15) + 32).toFixed();
        var nowDescription = todayResult.weather[0].description;
        var iconVal = todayResult.weather[0].icon;
        var icon = $(`<img src="icons/${iconVal}.png">`)
        var nowH3 = $(`<h3>The current temperature in ${todayResult.name} is: ${nowTemp} degrees.</h3>`);
        var description = $(`<p>Weather: ${nowDescription}</p>`);
        currentWeather.append(nowH3, icon, description);

        var pastList;
        if (localStorage.getItem('cityList')) {
            // push the search to local storage
            pastList = localStorage.getItem('cityList').split(',');
        } else {
            pastList = [];
        }
        if (!pastList.includes(todayResult.name)) {
            pastList.push(todayResult.name);
        };
        localStorage.setItem('cityList', pastList);
        // empty the past searches box
        $('#cityList').empty();
        // render the past 5 searches from local storage
        for (var i = 0; i < 5; i++) {
            if (pastList[i]) {
                var btn = $(`<submit class="btn btn-secondary">${pastList[i]}</submit>`)
                $("#cityList").append(btn);
            }
        }
        // clear the daily temps array
        dayTemps = [[], [], [], [], []]
    }
});