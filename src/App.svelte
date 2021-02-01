<script>
let value = '';
let inputType = 'text';

$: lengthError = !isValid(value, 'length');
$: lowerCaseError = !isValid(value, 'lowercase');
$: upperCaseError = !isValid(value, 'uppercase');
$: numberError = !isValid(value, 'numbers');


function isValid(password, requirement) {

let upperCaseArr = password.replace(/[^A-Z]+/g, '').split('');
let lowerCaseArr = password.replace(/[^a-z]+/g, '').split('');
let num = password.slice();
let numbers = num.replace(/[^0-9]+/g, '');

 switch(requirement){
case "length":
	  return password.length > 7 & password.length < 65;
	  
case "lowercase":

 return lowerCaseArr.length > 0;

case "uppercase":

return upperCaseArr.length > 0;


case "numbers": 
return numbers.length > 0

}
}

 function hideValue() {
		if (password.type === 'text') 
		{
			password.type = 'password'}
			else {
				password.type = 'text';
		}
	}

function handleOnSubmit() {
	if (
		lowerCaseError ||  lengthError || upperCaseError || numberError
	)
   { alert('Try another password')
	}

	else {
		alert('Ok');
	}
}

</script>

	<div class="container">
<h1>Change password</h1>
<p>Please enter a new password to complete the password recovery process.</p>
<div>
<input type={inputType}   on:input={(e) => (value = e.target.value)} id ="password" />
<button on:click={hideValue}>HIDE</button>
</div>
<ul>
	<li class:active ={!lengthError}>8-64 characters</li>
	<li class:active ={!lowerCaseError}>1 Lowercase</li>
	<li class:active ={!upperCaseError}>1 Uppercase</li>
	<li class:active ={!numberError}>1 Number</li>
	
</ul>
<button type ="submit" on:click={handleOnSubmit}> Confirm </button>
</div>



<style>
	h1 {
		color: green;
	}

    .active {
		outline : green 2px solid;
	}

	ul {
		width: 200px;
	}

	</style>