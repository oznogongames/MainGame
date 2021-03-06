using UnityEngine;
using System;
using System.Collections;


public delegate void TargetDestroyed();
public delegate void OnTakeDamage(DamageTypes type, float dam);


public class GeneralTrackableTarget: TargettableObject {
	
	public AudioClip[] sounds;
	ParticleSystem parts;
	
	int randomSound = 0;

	public  TargetDestroyed targetDestroyed;
	public OnTakeDamage onTakeDamage;
	
	public override void Start() {
		base.Start();
		//theShip = GameObject.Find("TheShip").transform;
		randomSound = UnityEngine.Random.Range(0,sounds.Length);
		parts = GetComponentInChildren<ParticleSystem>();	
		scanCode = Mathf.FloorToInt((float)UnityEngine.Random.Range(0, 10000));
		
//		if(statNames == null || statValues == null){
//			statNames = new String[2];
//			statValues = new float[2];
//			
//		}
		statNames[0] = "health";
		
		
		GameObject.Find("TheShip").GetComponent<TargettingSystem>().addObject(this);
		
	}
	
	public override void Update() {
	
		statValues[0] = health;
		
		
	}
	
	//strength is whatever the 
	public override void ApplyDamage(DamageTypes type, float damage){
		if(damageable){
			health -=damage;
			if(onTakeDamage != null){
				onTakeDamage(type, damage);
			}
			if(health <= 0){
				targetted = false;
				if(targetDestroyed != null){
					targetDestroyed();
				}
				//StartCoroutine(explode());
			}
		}
	}
	
	public override IEnumerator explode(){
		if(! exploding){
			exploding = true;
			
			//trigger particle effects
			if(parts == null){
				parts = GetComponentInChildren<ParticleSystem>();
				parts.Play();
			}

			AudioSource.PlayClipAtPoint(sounds[randomSound], transform.position);
			yield return new WaitForSeconds(6.0f);
			Destroy(gameObject);
		}
	}
}



