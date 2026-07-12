import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import User from "../src/models/user.model.js";

test("user mpin can be verified after hashing", async () => {
    const user = new User({
        fullName: { firstName: "Test", lastName: "User" },
        email: "mpin-test@example.com",
        mpin: await bcrypt.hash("1234", 10),
    });

    assert.equal(await user.isMpinCorrect("1234"), true);
    assert.equal(await user.isMpinCorrect("0000"), false);
});
