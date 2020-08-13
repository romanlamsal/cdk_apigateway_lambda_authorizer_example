import { encrypt, sign, verify } from "./src/impl/repository/kmsRepository"
import { createToken, validateToken } from "./src/impl/service/jwtTokenService"
import { putUserAuthorization } from "./src/impl/repository/cloudwatchMetrics"

//encrypt("").then(console.log)

async function signVerify() {
    const signed = await createToken({ username: "foobar" }, sign)
    console.log("SIGNED:", signed)
    const isValid = await validateToken(signed, verify)
    console.log("VALID", isValid)
}

//signVerify()

const message = "eyJ1eXAiOiJqd3QifQ==.eyJzdWIiOiJmb29iYXIiLCJpc3MiOiJzdWNjZXNzdG9yeS5kZSIsImV4cCI6Ijk5OTktMDEtMDFUMDA6MDA6MDAuMDAwWiJ9.UkouytfrWnVmxD1Q3IQl5wVe95d3arpylssYgvUHgI/pO2VzMkXdRp85LDwfZDGOB1k+cvtRM2O4X2BC0SVl1bM432e7N+mAJSfRy8uE3d3tVk\n" +
    "S4+ggV/xMMXcy9tBH8ZK8e7z4Z90hoGTC7l0vEvSF9v9AuUbteFtzSwYXu7O0uKT8b0KiJ5L3XJpy8TPgq/uYnP/TfU0vsROOzT+str3t6G9GzqWt1sR/mCLgwZOaSf2Ek9uCrAgNwDCrdMH9+ZRuKV67+0AyQObP6NcTqXcAafzj/2m3Xg/DfKe8fqNlAeksMU/iZ9X1esmR4tAhD9iOTpJ5es9dHVWxYB6RqJFUKhC\n" +
    "f2syGrUHD6+wL4NuwxtLUdIFyZS4jouACc4/8qp+/dr2fD9Ck0geIUc4rQ6IaN2XdaoTt7xbUyknPEHDpEE6Xl5rWW6x+r5QQo3qNngFxpe+ry2loqpfnj+NK20cNV6vmZNrmgom1Go0v7QXR1PrcaoeGuWj1Q1A4gxuapyNm4qg2cQ9O6BLYtcZbkVaFGD8A4c0pJX62aj3Vc/8/QIWipjcRGtog4RvzHWe4vI8qKBn\n" +
    "s/z+ir1qsJbTrwq5w4aYh6oc9yOc6Wm5II6mhIqGcjG/jOgTWZhSFmWTMlDSfhj7MouXepYo5wDh8NWTb3acmFAsbYsks5I0gfeHM="
//validateToken(message, verify).then(console.log)

async function putMetric() {
    // given
    const username = "foo"
    const sourceIp = "192.168.0.1"
    const resource = "/bar"
    const success = true

    // when
    const response = await putUserAuthorization(username, sourceIp, resource, success)
}
putMetric()
