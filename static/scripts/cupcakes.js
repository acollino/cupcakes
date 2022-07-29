class Cupcake {
  constructor(inputObj) {
    for (let attrib in inputObj) {
      this[attrib] = inputObj[attrib];
    }
  }

  generateJQuery() {
    let $cakeCard = $("<div>").addClass("column padded-1 card");
    let $imgHolder = $("<div>").addClass("picture-container");
    $imgHolder.append($(`<img src=${this.image}>`).addClass("profile-picture"));
    $cakeCard.append($imgHolder);
    $cakeCard.append($("<div>").text(`Flavor: ${this.flavor}`));
    $cakeCard.append($("<div>").text(`Size: ${this.size}`));
    $cakeCard.append($("<div>").text(`Rating: ${this.rating}`));
    $cakeCard.attr("data-id", this.id);
    return $cakeCard;
  }

  generateDeleter() {
    let $deleter = $("<div>").text("X").addClass("delete button button-red");
    $deleter.on("click", this.delete.bind(this));
    return $deleter;
  }

  async delete() {
    let fetchObj = { method: "delete" };
    let response = await fetch(`/api/cupcakes/${this.id}`, fetchObj);
    if (response.status == 200) {
      $(`div[data-id=${this.id}]`).remove();
    }
  }
}

class CupcakeList {
  constructor() {
    this.getAllCupcakes();
  }

  async getAllCupcakes() {
    let response = await fetch("/api/cupcakes");
    let cupcakes = (await response.json()).cupcakes;
    this.cupcakes = cupcakes.map((cake) => {
      return new Cupcake(cake);
    });
    this.displayAllCupcakes();
  }

  addCupcake(cupcake) {
    let $cakeCard = cupcake.generateJQuery();
    let $deleter = cupcake.generateDeleter();
    $deleter.on("click", () => {
      this.deleteCupcake($deleter.parents(".card").attr("data-id"));
    });
    $cakeCard.children(".picture-container").append($deleter);
    $("#cupcake-row").append($cakeCard);
  }

  displayAllCupcakes() {
    $("#cupcake-row").empty();
    for (let cupcake of this.cupcakes) {
      this.addCupcake(cupcake);
    }
  }

  async submitNewCupcake() {
    let inputs = Array.from($(".input-add"));
    let inputNamesValues = inputs.reduce((inputObj, currInput) => {
      inputObj[currInput.name] = Boolean(currInput.value)
        ? currInput.value
        : null;
      return inputObj;
    }, {});
    let fetchObj = {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputNamesValues),
    };
    let response = await fetch("/api/cupcakes", fetchObj);
    let newCake = new Cupcake((await response.json()).cupcake);
    this.cupcakes.push(newCake);
    this.addCupcake(newCake);
  }

  deleteCupcake(id) {
    this.cupcakes = this.cupcakes.filter((cake) => {
      return cake.id != id;
    });
  }
}

const cakesList = new CupcakeList();
$("#submit").click((evt) => {
  evt.preventDefault();
  cakesList.submitNewCupcake();
});
