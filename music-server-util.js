var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var musicmetadata = require("musicmetadata");

function fileExistsAsync(filePath)
{
    return new Promise(function(resolve, reject)
    {
        fs.statAsync(filePath).then(function(stat)
        {
            resolve(true);
        }).catch(function(error)
        {
            if(error.code === "ENOENT")
            {
                resolve(false);
            }
            else
            {
                reject(error);
            }
        });
    });
};

function getMetadataAsync(trackPath)
{
    return new Promise(function(resolve, reject)
    {
        musicmetadata(fs.createReadStream(trackPath), {}, function(err, metadata)
        {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(metadata);
            }
        });
    });
}

module.exports = {
    fileExistsAsync: fileExistsAsync,
    getMetadataAsync: getMetadataAsync
}
