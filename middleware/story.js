const express = require("express");
const redis = require("redis");

const Story = require("../model/user").Story;
const Chapter = require("../model/user").Chapter;
let redisClient;
if (process.env.REDIS_URL) {
    (async () => {
        redisClient = redis.createClient({
          host: REDIS_URL,
          port: REDIS_PORT || 6379,
        });
        redisClient.on("error", (error) => console.log(`Error: ${error}`));
        await redisClient.connect();
    })();    
}

exports.story = async (req, res) => {
    let isCached = false;
    let result;
    
    try {
        let newobj = {
            id: req.params.id
        }
        
        if (process.env.REDIS_URL) {
            const cacheStory = await redisClient.get(`story:${req.params.id}`);
            if (cacheStory) {
              isCached = true;
              result = JSON.parse(cacheStory);
            }
          }
        
        if (!isCached) {
            result = await Story.findOne({ ...newobj }).populate([
              {
                path: "user"
              },
              {
                path: "chapters",
                populate: {
                  path: "content",
                  model: "chapter"
                }
              }
            ]);
            if (!result) throw 'No Story with that ID';

            // Cache the result if Redis is available
            if (process.env.REDIS_URL) {
              await redisClient.set(`story:${req.params.id}`, JSON.stringify(result));
            }
        }

        console.log(`cache data ${isCached}`);
        return res.status(201).json(result);
    } catch (err) {
        console.log(err);
        return res.status(400).send(err);
    }
}

exports.chapterNum = async (req, res) => {
    try {
        let chapterid = req.params.chapterid
        let newobj = {
            id: req.params.id,
        }


        const story = await Story.findOne({...newobj}).populate([{
            path: "user",
        },{
            path: "chapters",
            populate: {
                path: "content",
                model: "chapter",
                perDocumentLimit: 1,
            }
        }]);
        const chapter = await Chapter.findOne();
    
        return res.status(201).json(story);
    } catch (err) {
        console.log(err);
        return res.status(400).send(err);
    }
}

exports.storylist = async (req,res) => {
    try {
        const story = await Story.find()
            .populate({
                path: "user",
            })
            .sort({id: 1})
            .skip(0)
            .limit(20);

        if (story) {
            console.log("work");
        } else {
            console.log("not work :P");
        }
        return res.status(201).json(story);
        
    } catch (err) {
        console.log(err);
        return res.status(400).send(err);
    }
}

exports.searchstory = async (req,res) => {
    try {
        const searchText = req.query.q;
        console.log(searchText)

        if (!searchText) {
          return res.status(400).send({ message: 'Please provide a search term' });
        }
      
        // Create text index on the required fields
        // Perform the full-text search
        const stories = await Story.find(
          { $text: { $search: searchText } },
          { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } });
      
        const chapterIds = stories.map(story => story.chapters.map(chapter => chapter.content));
      
        // const chapters = await Chapter.find({
        //   '_id': { $in: chapterIds },
        //   $text: { $search: searchText }
        // }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
      
        res.send({ stories });
    } catch (err) {
        console.log(err);
        return res.status(400).send(err);
    }
}

