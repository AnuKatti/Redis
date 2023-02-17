let express = require('express');
let axios = require('axios');
let redis = require('redis');
let port = process.env.PORT || 8811
let app = express();

const client = redis.createClient({
    host: 'localhost',
    port: 6379
})

app.get('/data',(req,res) => {
    let userInput = req.query.country.trim()
    userInput = userInput ? userInput:'India'
    const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${userInput}`;
    //check data in Redis
    return client.get(userInput,function(err,result){
        //if data in Redis
        if (result){
            const output = JSON.parse(result)
            res.send(output)
        }else{
            //if data not in Redis then call api to get data
            axios.get(url)
                .then((response) => {
                    //save data in Redis
                    const output = response.data
                    client.setex(userInput,3600,JSON.stringify({source:'Redis Cache',output}))
                    //for first time
                    res.send({source:'API response',output})
                })
        }

    })
})

app.listen(port,() => {

    console.log(`listening on port ${port}`)
})
