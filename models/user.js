import USER from "../schema/schema.js";

class User {
  constructor(name, email, phone, password, role) {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.role = role;
  }

  async save() {
    try {
      const result = await USER.create({
        name: this.name,
        email: this.email,
        phone: this.phone,
        password: this.password,
        role: this.role,
      });
      return result;
    } catch (err) {
      console.error("Error saving user:", err);
      throw err;
    }
  }
  static async getUser(email, role) {
    const user = await USER.findOne({ email, role });
    return user;
  }

  static async getUserById(id) {
    try {
      return await USER.findById(id);
    } catch (err) {
      console.error("Error finding user by id:", err);
      throw err;
    }
  }
}

export default User;
