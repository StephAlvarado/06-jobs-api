const request = require("supertest");
const app = require("../app"); 
const { expect } = require("chai");

describe("Logoff Endpoint", function () {
    let csrfToken = "";
    let sessionCookie = "";

    before(async function () {
       
        const loginResponse = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "testuser@example.com",
                password: "testpassword"
            });

        const cookies = loginResponse.headers["set-cookie"];
        const csrfCookie = cookies.find(cookie => cookie.startsWith("_csrf"));
        const sessionCookieRaw = cookies.find(cookie => cookie.startsWith("session="));

        if (!csrfCookie || !sessionCookieRaw) {
            throw new Error("CSRF token or session cookie missing after login");
        }

        csrfToken = csrfCookie.split(";")[0]; // Example: _csrf=abcd1234
        sessionCookie = sessionCookieRaw.split(";")[0]; // Example: session=xyz987

        expect(loginResponse.status).to.equal(200);
    });

    it("should logoff successfully when authenticated and CSRF protected", async function () {
        const response = await request(app)
            .post("/api/v1/auth/logoff")
            .set("Cookie", `${csrfToken}; ${sessionCookie}`)
            .send({
                _csrf: csrfToken.split("=")[1] // Only send the value, not the full cookie
            });

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("msg").that.equals("Logged off successfully");
    });

    it("should fail logoff without proper CSRF token", async function () {
        const response = await request(app)
            .post("/api/v1/auth/logoff")
            .set("Cookie", `${sessionCookie}`)
            .send({});

        expect(response.status).to.equal(403); // CSRF protection should trigger this
    });
});
