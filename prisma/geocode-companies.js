"use strict";
/**
 * Script de géocodage des companies
 *
 * Ce script parcourt toutes les companies sans coordonnées GPS
 * et tente de les géocoder via l'API adresse.data.gouv.fr
 *
 * Usage: npx tsx prisma/geocode-companies.ts
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var adapter_pg_1 = require("@prisma/adapter-pg");
var client_1 = require("../generated/prisma/client");
var connectionString = process.env.DATABASE_URL;
var adapter = new adapter_pg_1.PrismaPg({ connectionString: connectionString });
var prisma = new client_1.PrismaClient({ adapter: adapter });
function geocodeAddress(address, city, postalCode) {
    return __awaiter(this, void 0, void 0, function () {
        var query, url, response, data, feature, _a, longitude, latitude, score, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = [address, postalCode, city].filter(Boolean).join(" ");
                    if (!query.trim()) {
                        return [2 /*return*/, null];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    url = new URL("https://api-adresse.data.gouv.fr/search/");
                    url.searchParams.set("q", query);
                    url.searchParams.set("limit", "1");
                    return [4 /*yield*/, fetch(url.toString(), {
                            headers: { Accept: "application/json" },
                        })];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        console.error("  Erreur API: ".concat(response.status));
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _b.sent();
                    if (!data.features || data.features.length === 0) {
                        return [2 /*return*/, null];
                    }
                    feature = data.features[0];
                    _a = feature.geometry.coordinates, longitude = _a[0], latitude = _a[1];
                    score = feature.properties.score;
                    // Seuil de confiance minimum (0.5 = 50%)
                    if (score < 0.5) {
                        console.log("  Score trop bas (".concat(score.toFixed(2), "), ignor\u00E9"));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, { latitude: latitude, longitude: longitude }];
                case 4:
                    error_1 = _b.sent();
                    console.error("  Erreur:", error_1);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var companies, success, failed, skipped, _i, companies_1, company, coords;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Démarrage du géocodage des companies...\n");
                    return [4 /*yield*/, prisma.company.findMany({
                            where: {
                                OR: [{ latitude: null }, { longitude: null }],
                            },
                            select: {
                                id: true,
                                name: true,
                                address: true,
                                city: true,
                                postalCode: true,
                            },
                        })];
                case 1:
                    companies = _a.sent();
                    console.log("".concat(companies.length, " companies \u00E0 g\u00E9ocoder\n"));
                    success = 0;
                    failed = 0;
                    skipped = 0;
                    _i = 0, companies_1 = companies;
                    _a.label = 2;
                case 2:
                    if (!(_i < companies_1.length)) return [3 /*break*/, 9];
                    company = companies_1[_i];
                    console.log("[".concat(company.name, "]"));
                    // Vérifier qu'on a assez d'infos pour géocoder
                    if (!company.city && !company.postalCode) {
                        console.log("  Pas d'adresse, ignoré\n");
                        skipped++;
                        return [3 /*break*/, 8];
                    }
                    return [4 /*yield*/, geocodeAddress(company.address || "", company.city || "", company.postalCode || "")];
                case 3:
                    coords = _a.sent();
                    if (!coords) return [3 /*break*/, 5];
                    return [4 /*yield*/, prisma.company.update({
                            where: { id: company.id },
                            data: {
                                latitude: coords.latitude,
                                longitude: coords.longitude,
                            },
                        })];
                case 4:
                    _a.sent();
                    console.log("  G\u00E9ocod\u00E9: ".concat(coords.latitude, ", ").concat(coords.longitude, "\n"));
                    success++;
                    return [3 /*break*/, 6];
                case 5:
                    console.log("  Échec du géocodage\n");
                    failed++;
                    _a.label = 6;
                case 6: 
                // Petite pause pour ne pas surcharger l'API
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 200); })];
                case 7:
                    // Petite pause pour ne pas surcharger l'API
                    _a.sent();
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 2];
                case 9:
                    console.log("---");
                    console.log("Termin\u00E9!");
                    console.log("  Succ\u00E8s: ".concat(success));
                    console.log("  \u00C9checs: ".concat(failed));
                    console.log("  Ignor\u00E9s: ".concat(skipped));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (error) {
    console.error("Erreur fatale:", error);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
