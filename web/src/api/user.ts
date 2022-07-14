export const getUserData = async () => {
  const url = 'https://hp9bcapk7j.execute-api.eu-west-3.amazonaws.com/dev/ping'
  const data = await fetch(url)
  return data
  // return 'callingGetUserData'
}
