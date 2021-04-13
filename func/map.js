const $ = require('../base');

const {func_} = $;

func_(function echo(value) {
  return value;
});

func_(async function aecho(value) {
  return value;
});

func_(function nullMap(value) {
  return null;
}, 'null');

func_(async function anull(value) {
  return null;
});

func_(function not(value) {
  return !value;
});

func_(async function anot(value) {
  return !value;
});

func_(function neg(value) {
  return -value;
});

func_(async function aneg(value) {
  return -value;
});

func_(function bound() {
  return this;
});

func_(async function abound() {
  return this;
});

module.exports = $;
