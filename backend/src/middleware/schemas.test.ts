import assert from "node:assert/strict";
import test from "node:test";

import {
    createTravelSchema,
    trackEventSchema,
    updateProjectSchema,
} from "./schemas";

test("travel coordinates must be physically valid", () => {
    const result = createTravelSchema.safeParse({
        lat: 95,
        lng: 30,
        label: "Test",
        country: "Test",
        description: "Test",
        image: "/image.webp",
    });

    assert.equal(result.success, false);
});

test("analytics accepts only known, bounded events", () => {
    assert.equal(
        trackEventSchema.safeParse({ action: "drop_database", details: "x" }).success,
        false
    );
    assert.equal(
        trackEventSchema.safeParse({ action: "view_project", details: "Portfolio" }).success,
        true
    );
});

test("update payloads strip unknown fields", () => {
    const result = updateProjectSchema.parse({ title: "Updated", role: "admin" });

    assert.deepEqual(result, { title: "Updated" });
});
