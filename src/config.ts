
export default {
  /*
    Server Stuff
  */
  port: process.env.POST || 4201,

  /*
    Pre-Tagged API
  */
  preTagger_api_host: process.env.PRETAGGER_API_HOST || "127.0.0.1",
  preTagger_api_port: process.env.PRETAGGER_API_PORT || 5000,


  /*
    AWS Config Vars
  */
  aws_bucket: process.env.AWS_BUCKET || "shhhhh",
  aws_region: process.env.AWS_REGION || "somewhere",
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID || "Wouldn't you like to know, weather boy.",
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY || "Wouldn't you like to know, weather boy.",


  /*
    FACEBOOK API KEYS
  */
  facebook_api_key: process.env.FACEBOOK_API_KEY || "Wouldn't you like to know, weather boy.",
  facebook_api_secret: process.env.FACEBOOK_API_SECRET || "Wouldn't you like to know, weather boy."
}
