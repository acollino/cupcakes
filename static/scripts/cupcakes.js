const $editForm = $(
  `<div class="border border-rounded column edit-container">
    <form class="column-small">
      <h3>Edit Cupcake</h3>
      <hr>
      <label for="edit-flavor" class="margin-half-top">New Flavor</label>
      <input type="text" id="edit-flavor" class="input-edit" name="flavor" size="15">
      <label for="edit-size" class="margin-half-top">New Size</label>
      <input type="text" id="edit-size" class="input-edit" name="size" size="13">
      <label for="edit-rating" class="margin-half-top">New Rating</label>
      <input type="number" id="edit-rating" class="input-edit" step="0.1" size="3" name="rating" min="0" max="10">
      <label for="edit-image" class="margin-half-top">New Image</label>
      <input type="url" id="edit-image" class="input-edit" name="image" size="15">
      <button class="button-blue margin-half-top edit-submit">Submit</button>
    </form>
  </div>`
);

const addCupcakeFormat = [
  { type: "string", required: true },
  { type: "string", required: true },
  { type: "number", required: true, min:0, max:10 },
  { type: "url", required: false },
];

const editCupcakeFormat = [
  { type: "string", required: false },
  { type: "string", required: false },
  { type: "number", required: false , min:0, max:10 },
  { type: "url", required: false },
];

const urlRegex = /^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i;
// regex testing and information: https://regex101.com/r/yAaf6p/1

class Cupcake {
  constructor(inputObj) {
    ({
      flavor: this.flavor,
      size: this.size,
      rating: this.rating,
      image: this.image,
      id: this.id,
    } = inputObj);
  }

  generateJQuery() {
    let $cakeCard = $("<div>").addClass(
      "column-small card border border-rounded"
    );
    let $imgHolder = $("<div>").addClass("picture-container");
    $imgHolder.append($(`<img src=${this.image}>`).addClass("profile-picture"));
    $cakeCard.append($imgHolder);
    $cakeCard.append(
      $("<div>").text(`Flavor: ${this.flavor}`).addClass("cupcake-details")
    );
    $cakeCard.append($("<hr>"));
    $cakeCard.append(
      $("<div>").text(`Size: ${this.size}`).addClass("cupcake-details")
    );
    $cakeCard.append($("<hr>"));
    $cakeCard.append(
      $("<div>").text(`Rating: ${this.rating}/10`).addClass("cupcake-details")
    );
    $cakeCard.attr("data-id", this.id);
    return $cakeCard;
  }

  generateDeleter() {
    let $deleter = $("<div>").addClass("delete button button-red");
    $deleter.append(
      $("<img>").attr("src", "/static/assets/delete.svg").addClass("icon")
    );
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

  async edit() {
    let fetchObj = convertInputIntoFetchObj(".input-edit:visible", "patch");
    let response = await fetch(`/api/cupcakes/${this.id}`, fetchObj);
    if (response.status == 200) {
      let updatedCake = await response.json();
      Object.assign(this, updatedCake.cupcake);
      this.updateDOM();
    }
  }

  updateDOM() {
    let $cakeCard = $(`div[data-id=${this.id}]`);
    $cakeCard.find(".profile-picture").attr("src", this.image);
    $cakeCard.children(":contains('Flavor: ')").text(`Flavor: ${this.flavor}`);
    $cakeCard.children(":contains('Size: ')").text(`Size: ${this.size}`);
    $cakeCard.children(":contains('Rating: ')").text(`Rating: ${this.rating}/10`);
    $cakeCard.find(".edit-container").css("display", "none");
  }

  addEditFormEventHandler() {
    let $cakeCard = $(`div[data-id=${this.id}]`);
    $cakeCard.find(".edit-submit").on("click", (evt) => {
      evt.preventDefault();
      let inputs = $(evt.currentTarget).siblings(".input-edit").get();
      if (validateInputArray(inputs, editCupcakeFormat)) {
        this.edit();
      }
    });
  }
};

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
    let $editButton = $("<div>").addClass("edit button button-light-blue");
    $editButton.append(
      $("<img>").attr("src", "/static/assets/edit.svg").addClass("icon")
    );
    $deleter.on("click", () => {
      this.deleteCupcake($deleter.parents(".card").attr("data-id"));
    });
    $editForm.clone().appendTo($cakeCard.children(".picture-container"));
    $cakeCard.children(".picture-container").append($deleter);
    $cakeCard.children(".picture-container").append($editButton);
    $editButton.on("click", (evt) => {
      let $currentEdit = $(evt.currentTarget).siblings(".edit-container");
      let $otherEdits = $(".edit-container").not($currentEdit);
      $otherEdits.css("display", "none");
      $currentEdit.toggle();
    });
    $("#cupcake-row").append($cakeCard);
    cupcake.addEditFormEventHandler();
  }

  displayAllCupcakes() {
    $("#cupcake-row").empty();
    for (let cupcake of this.cupcakes) {
      this.addCupcake(cupcake);
    }
  }

  async submitNewCupcake() {
    let fetchObj = convertInputIntoFetchObj(".input-add", "post");
    let response = await fetch("/api/cupcakes", fetchObj);
    let newCake = new Cupcake((await response.json()).cupcake);
    this.cupcakes.push(newCake);
    this.addCupcake(newCake);
  }

  getCupcakeById(id) {
    matchingCake = this.cupcakes.filter((cake) => {
      return cake.id == id;
    });
    return matchingCake[0];
  }

  deleteCupcake(id) {
    this.cupcakes = this.cupcakes.filter((cake) => {
      return cake.id != id;
    });
  }
}

function convertInputIntoFetchObj(inputClass, fetchMethod) {
  let inputs = Array.from($(inputClass));
  let inputNamesAndValues = inputs.reduce((inputObj, currInput) => {
    if (Boolean(currInput.value)) {
      inputObj[currInput.name] = currInput.value;
      if (currInput.name !== "image") {
        inputObj[currInput.name] = toTitleCase(inputObj[currInput.name]);
      }
    }
    return inputObj;
  }, {});
  let fetchObj = {
    method: fetchMethod,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputNamesAndValues),
  };
  $(inputClass).val("");
  return fetchObj;
}

function validateInputArray(inputArray, expectedInputs) {
  let validSize = inputArray.length === expectedInputs.length;
  let htmlValidity = true;
  let typeValidity = true;
  inputArray.forEach((userInput, index) => {
    htmlValidity = htmlValidity && userInput.reportValidity();
    if (expectedInputs[index].type === "number") {
      typeValidity = typeValidity && !isNaN(userInput.value)
        && userInput.value >= expectedInputs[index].min
        && userInput.value <= expectedInputs[index].max;
    }
    if (expectedInputs[index].type === "url") {
      let inURLFormat = urlRegex.test(userInput.value);
      let notRequired =
        expectedInputs[index].required === false && userInput.value === "";
      typeValidity = typeValidity && (inURLFormat || notRequired);
      // This check prevents a non-required URL from invalidating the form, 
      // as it would fail the regex test if left blank.
    }
  });
  return validSize && htmlValidity && typeValidity;
}

function toTitleCase(str) {
  return str.replace(/\w+\W*/g, (word) => {
    return titleWord(word);
  });
}

function titleWord(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

const cakesList = new CupcakeList();
$("#add-submit").click((evt) => {
  evt.preventDefault();
  let inputs = $(".input-add").get();
  if (validateInputArray(inputs, addCupcakeFormat)) {
    cakesList.submitNewCupcake();
  }
});
