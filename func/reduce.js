const $ = require('../base');

const {func_} = $;

func_(function sum(a, b) {
  return a + b;
});

func_(function safeSum(a, b) {
  return (+a || 0) + (+b || 0);
});

func_(function prod(a, b) {
  return a * b;
});

func_(function safeProd(a, b) {
  return (+a || 1) * (+b || 1);
});

func_(function max(a, b) {
  return a > b ? a : b;
});

func_(function safeMax(a, b) {
  return a == null ? b : b == null ? a : a > b ? a : b;
});

func_(function min(a, b) {
  return a < b ? a : b;
});

func_(function safeMin(a, b) {
  return a == null ? b : b == null ? a : a < b ? a : b;
});

func_(function bitOr(a, b) {
  return a | b;
});

func_(function bitAnd(a, b) {
  return a & b;
});

func_(function bitClr(a, b) {
  return a & ~b;
});

func_(function bitXor(a, b) {
  return a ^ b;
});

func_(function or(a, b) {
  return a || b;
});

func_(function orr(a, b) {
  return b || a;
});

func_(function and(a, b) {
  return a && b;
});

func_(function andr(a, b) {
  return b && a;
});

func_(function andNot(a, b) {
  return a ? (b ? null : a) : a;
});

func_(function xor(a, b) {
  return a ? (b ? null : a) : (b ? b : null);
});

module.exports = $;
