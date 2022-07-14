import { API } from "aws-amplify"

const MY_API = "apirepr"
const PATH = "/ping"

export const getPing = async () => {
  const data = await API.get(MY_API, PATH, {})
  // const value = await API.get(MY_API, PATH)
  // return value
  return data
}