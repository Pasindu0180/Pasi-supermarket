export default {
  async fetch(request: Request) {
    if (request.method === "GET") {
      return Response.json({
        success: true,
        message: "Pasi Supermarket RFID API online"
      });
    }

    if (request.method === "POST") {
      const body = await request.json();

      return Response.json({
        success: true,
        message: "RFID received",
        received: body
      });
    }

    return new Response("Method not allowed", {
      status: 405
    });
  }
};