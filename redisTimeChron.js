var redis = require("redis")
  , client = redis.createClient();

//Makes "LOUD" in console if true
redis.debug_mode = false;

//test var.
var currentTime = new Date();

client.on("error", function (err) {
	//todo make this write to a log file.
    console.log("Error " + err);
})
.on("connect", function () {
//	console.log("connect");
})
.on("ready", function () {
  console.log("version: ", client.server_info.redis_version);
});

//Check to see if job has run before. Remember Redis is async.
client.get("jobStamp", function( err, reply ) {
  /* 
   * Description: Check and Set times to DB
  */
  if(err) console.log("Error, Is Redis running? : " + err);
  // first run and no data stored 
  if(reply !== null) {
	console.log("Job Never Run");
	
    //setup the setters here
	console.log("job has run before");
    var timeStampJob = new Date();
    var nextTimeStampJob = new Date();
    nextTimeStampJob.setMinutes(timeStampJob.getMinutes() + 1); 
    nextTimeStampJob = nextTimeStampJob.valueOf();
    timeStampJob = timeStampJob.valueOf()	
    //set data in DB. TODO: Convert to hset to build obj for all time related matters.
    client.set("jobStamp" , timeStampJob);
    client.set("nextJobStamp" , nextTimeStampJob);

	job();
  }
  //TODO: make a condition to clear out old data. You manually have to dump db if the 15mins value is skipped..
  else{
   job();
  }

});

function job(){
	
  var currentStamp, nextStamp;

  client.get("jobStamp" , function (err, reply) {
     console.log(reply.toString()); // <- This is job time.
     currentStamp = reply.toString();
  });
      
  client.get("nextJobStamp" , function (err, reply) {
    console.log(reply.toString()); // <- This next  job time.
    nextStamp = reply.toString();
  });

  console.log("This is the current time: " , currentTime);
  client.set("dateNow" , currentTime);
  client.get("dateNow" , function (err, reply) {
    console.log(reply.toString()); // <- This is current time.
  });

   client.on('idle' , function() {
   setInterval(function() {
      //TODO: update currentTime every second then run the job once current and next are =. THen do it over and over.
      currentTime = new Date(); 
	  currentTime = currentTime.valueOf();
	  console.log(nextStamp);
      if ( currentTime <= nextStamp ) console.log("time is less than");
      if ( currentTime >= nextStamp ) console.log("new nextStamp needed");
   }, 1000);	

 });
}


