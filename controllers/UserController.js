import Users from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

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

export const getUserById = async (req, res) => {
  try {
    const response = await Users.findOne({
      where: { user_id: req.params.id },
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getFilteredUsers = async (req, res) => {
  let { start, limit, searchQuery } = req.query;
  start = start ? parseInt(start) : null;
  limit = limit ? parseInt(limit) : null;
  const searchFilter = searchQuery
    ? {
      [Op.or]: [
        {
          category: {
            [Op.like]: `%${searchQuery}%`,
          },
        },
      ],
    }
    : {};
  try {
    const response = await Users.findAll({
      order: [["createdAt", "ASC"]],
      offset: start,
      limit: limit,
      where: {
        ...searchFilter,
      },
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const register = async (req, res) => {
  const { name, username, password, confirmPassword } = req.body;

  if (password.length < 6) {
    return res.status(400).json({ msg: "Password must be at least 6 characters long" });
  }

  const passwordPattern = /^(?=.*\d)(?=.*[A-Z]).{6,}$/;
  if (!passwordPattern.test(password)) {
    return res.status(400).json({
      msg: "Password must contain at least one digit and one uppercase letter, and be at least 6 characters long",
    });
  }

  const user = await Users.findOne({
    where: {
      username: req.body.username,
    },
  });
  if (user) {
    return res.status(400).json({ msg: "Username is already registered" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Password and Confirm password do not match" });
  }

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  try {
    await Users.create({
      name,
      username,
      password: hashPassword,
    });
    res.json({ msg: "Account sucessfully registered" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  const { name, username, password, confirmPassword } = req.body;
  const getUserById = await Users.findOne({
    where: {
      user_id: req.params.id,
    },
  });
  if (!getUserById) return res.status(404).json({ msg: "Data not found" });
  if (password?.length < 6) {
    return res.status(400).json({ msg: "Password must be at least 6 characters long" });
  }

  const passwordPattern = /^(?=.*\d)(?=.*[A-Z]).{6,}$/;
  if (!passwordPattern.test(password)) {
    return res.status(400).json({
      msg: "Password must contain at least one digit and one uppercase letter, and be at least 6 characters long",
    });
  }

  const user = await Users.findOne({
    where: {
      username: req.body.username,
      user_id: {
        [Op.ne]: req.params.id,
      },
    },

  });
  if (user) {
    return res.status(400).json({ msg: "Username is already registered" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Password and Confirm password do not match" });
  }

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  try {
    await Users.update(
      {
        name,
        username,
        ...(password !== getUserById?.password && { password: hashPassword })
      },
      {
        where: {
          user_id: req.params.id,
        },
      }
    );
    res.status(200).json({ msg: `Account successfully updated` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  const getUserById = await Users.findOne({
    where: {
      user_id: req.params.id,
    },
  });
  if (!getUserById) return res.status(404).json({ msg: "Data not found" });

  try {
    await Users.destroy({
      where: {
        user_id: req.params.id,
      },
    });
    res.status(200).json({ msg: `Account successfully deleted` });
  } catch (error) {
    console.log(error.message);
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
    res.cookie("refreshToken", refreshToken, {
      sameSite: "none",
      secure: true,
      domain: "pink-frail-woodpecker.cyclic.app",
      httpOnly: true
    });

    res.json({ accessToken })
    console.time()
  } catch (error) {
    console.log(error.message);
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
    refresh_token: null
  }, {
    where: {
      user_id: userId
    }
  })
  res.clearCookie('refreshToken')
  return res.sendStatus(200)
}