class UserModule {
  private static instance: UserModule

  private userInstance = 'UserModule user'

  get user() {
    return this.userInstance
  }

  static getInstance() {
    if (!UserModule.instance) {
      UserModule.instance = new UserModule()
    }
    return UserModule.instance
  }
}

export default UserModule
