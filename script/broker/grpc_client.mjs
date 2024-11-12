// const grpc = require('@grpc/grpc-js');
// const protoLoader = require('@grpc/proto-loader');

// // 加载 proto 文件
// const packageDefinition = protoLoader.loadSync('hello.proto', {
//     keepCase: true,
//     longs: String,
//     enums: String,
//     defaults: true,
//     oneofs: true
// });

// const helloProto = grpc.loadPackageDefinition(packageDefinition).hello;

// // 创建 gRPC 客户端
// const client = new helloProto.HelloService('localhost:50051', grpc.credentials.createInsecure());

// // 调用远程方法
// const request = { name: 'World' };
// // client.SayHello(request, (err, response) => {
// //     if (err) {
// //         console.error(err);
// //         return;
// //     }
// //     console.log(response.message);
// // });
// export { client };
