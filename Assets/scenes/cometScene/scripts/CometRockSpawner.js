﻿#pragma strict


var rockPrefabs : Transform[];
var poolSize : int = 20;

var spawnArea : Bounds;

private var rockPool  :Transform[];


var spawnRate : float = 1;
var initialSpeed : float = 20f;

private var lastSpawnTime : float;
private var nextSpawnTime : float;
private var theShip : Transform;

private var startPosition : Vector3;

private var spawnRocks: boolean = true;

function Start () {
	theShip = GameObject.Find("TheShip").transform;
	startPosition = transform.position;
	rockPool = new Transform[poolSize];
	
	//fill the pool
	for(var i = 0; i < poolSize; i++){
		var t : Transform = Instantiate(rockPrefabs [ Random.Range(0, rockPrefabs.length) ] , Vector3(0,0,-10000), Quaternion.identity);
		t.gameObject.SetActive(false);
		
		rockPool[i] = t;
	}

}



/* update the rate at which we spawn rocks */
function setRate(newRate : float){
	if(newRate <= 0.0f){
		spawnRocks = false;
	} else {
		spawnRocks = true;
			
		spawnRate = newRate;
		nextSpawnTime = 1/spawnRate;
	}
}

function FixedUpdate () {

	var pos : Vector3 = theShip.position;
	pos.z = startPosition.z;
	transform.position = pos;
	if(spawnRocks){
		if(Time.fixedTime - lastSpawnTime > nextSpawnTime){
			lastSpawnTime = Time.fixedTime;
			nextSpawnTime =  1/spawnRate;
			spawnNew();	
		}
	}

}

function spawnNew(){
	var t : Transform = findFreeFromPool();
	if(t != null){
		t.position = Vector3(Random.value * spawnArea.size.x, Random.value * spawnArea.size.y, Random.value * spawnArea.size.z) + transform.position - spawnArea.size / 2f;
		t.gameObject.SetActive(true);
		t.rigidbody.velocity = Vector3.forward * initialSpeed;
	}
}

function findFreeFromPool() : Transform {
	for(var t : Transform in rockPool){
		if(t.gameObject.activeInHierarchy == false){
			return t;
		}
	}
	return null;
	

}


function OnDrawGizmosSelected(){
	Gizmos.DrawWireCube(transform.position + spawnArea.center, spawnArea.size);
}