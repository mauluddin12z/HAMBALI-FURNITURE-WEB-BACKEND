import Users from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
  try {
    const response = await Users.findAll({
      attributes: ["user_id", "name", "username"],
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

export const register = async (req, res) => {
  const { name, username, password, confPassword } = req.body

  if (password !== confPassword) return res.status(400).json({ msg: "Password dan Confirm password tidak cocok" })
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt)
  try {
    await Users.create({
      name, username, password: hashPassword
    })
    res.json({ msg: "Register berhasil" })
  } catch (error) {
    console.log(error)
  }
};

export const login = async (req, res) => {
  try {
    const user = await Users.findAll({
      where: {
        username: req.body.username
      }
    })
    if (user.length === 0) {
      return res.status(404).json({ msg: "Username tidak ditemukan" });
    }

    const match = await bcrypt.compare(req.body.password, user[0].password)
    if (!match) return res.status(400).json({ msg: "Password salah" })
    const userId = user[0].user_id
    const name = user[0].name
    const username = user[0].username
    const accessToken = jwt.sign({ userId, name, username }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '20s'
    })
    const refreshToken = jwt.sign({ userId, name, username }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '1d'
    })
    await Users.update({ refresh_token: refreshToken }, {
      where: {
        user_id: userId
      }
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
      domain: "hambali-furniture-web-backend.vercel.app",
    })
    res.json({ accessToken })
  } catch (error) {
    res.status(404).json({ msg: "Username tidak ditemukan" })
  }
}

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) return res.sendStatus(204)
  const user = await Users.findAll({
    where: {
      refresh_token: refreshToken
    }
  })
  if (!user[0]) return res.sendStatus(204)
  const userId = user[0].user_id
  await Users.update({
    refreshToken: null
  }, {
    where: {
      user_id: userId
    }
  })
  res.clearCookie('refreshToken')
  return res.sendStatus(200)
}