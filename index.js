// B1: tạo file index.js
// B2: mở terminal chạy lệnh yarn init
// B3: cập nhật file package.json
//          + "type":"module"
//          +"script":"node index.js"
// B4: yarn add express dotenv nodemon
// B5: setup như bên dưới

import express from "express";

const app = express();
app.listen(8080);

import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";

const schemaGraphql = buildSchema(`
    type User{
      user_id: ID
      full_name: String
      email: String
      pass_word: String
    }

    type RootQuery {
      getDemo: String
      getUser: User
      getFood: String
      getListUser(id: Int, email: String): [User]
      getListNumber: [Int]
    }

    type RootMutation {
      createUser: String
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }


`);

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const resolver = {
  getDemo: () => {
    return "Hello";
  },
  getUser: () => {
    return {
      id: 1,
      userName: "abc",
      email: "abc@gmail.com",
    };
  },
  getFood: () => {
    return 123;
  },
  getListUser: async ({ id, email }) => {
    let data = await prisma.user.findMany({ where: { user_id: id } });
    return data;
  },
  getListNumber: () => {
    return [2, 3, 10];
  },
};

app.use(
  "/graphql",
  // localhost:8080/graphql
  graphqlHTTP({
    schema: schemaGraphql, // quản lý object
    rootValue: resolver, // định nghĩa, quản lý hàm để gán data cho object
    graphiql: true,
  })
);

app.get("/demo", (req, res) => {
  res.send("hello world");
});

// yarn prisma generate => làm mới lại model trong thư viện @prisma/client

app.get("/get-food", async (req, res) => {
  // .findAll()
  // SELECT * FROM food WHERE food_name LIKE '%a%'
  // let data = await prisma.food.findMany({
  //   where: {
  //     food_name: {
  //       contains: "a",
  //     },
  //   },
  // });
  // JOIN food , food_type
  let data = await prisma.food.findMany();
  // include: {
  //   order: {
  //     include: {
  //       user: true,
  //     },
  //   },
  // },
  // await prisma.food.findMany(); // => list object [{},{}]
  // await prisma.food.findUnique(); // => object {} sẽ bị lỗi khi có nhiều dòng dữ liệu
  // await prisma.food.findFirst(); // => object {} nên dùng findFist
  res.send(data);
});

app.post("/create-food", async (req, res) => {
  let { food_id } = req.params; // string
  let { food_name, image, price, desc, type_id, color } = req.body; // ** phải đúng kiểu dữ liệu được khai báo bên shcema
  let newData = { food_name, image, price, desc, type_id, color };

  await prisma.food.create({ data: newData }); // ** phải gán vào class data của prisma
  await prisma.food.update({
    data: newData,
    where: {
      food_id: Number(food_id), // vì là string nên phải ép kiểu số
    },
  });
  await prisma.food.createMany({ data: [newData, newData, newData] });

  await prisma.food.delete({ where: { food_id: +food_id } });

  await prisma.$executeRaw("SELECT * FROM food"); // dùng để viết câu lệch query
});

// database first
// yarn prisma db pull
// yarn prisma generate
