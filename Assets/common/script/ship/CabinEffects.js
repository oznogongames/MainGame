import System.Collections.Generic;
import System;
/* cabin based effects
 * for now control the cabin lighting, set red alert states and queue voiceovers from ships comp
 * future use:
 * air effects, drop effects etc
 */

var shipsComputerSource : AudioSource;
var loopingAudioSource : AudioSource;
public var redAlertLoop : AudioClip;

public static var _instance : CabinEffects;
private var currentClip : AudioClip;
private var repeatClip : AudioClip;
private var redAlert : boolean = false;

private var clipQueue : List.<AudioEntry>;

private var playing : boolean = false;


//lighting
private var previousLightMode : int = 0;
private var lightMode : int = 0;
private var lightState : boolean = false;
private var airlockLightState : boolean = false;

public static final var LIGHT_IDLE : int = 0;
public static final var LIGHT_WARP : int = 1;
public static final var LIGHT_REDALERT : int = 3;
public static final var LIGHT_BRIEFING : int = 3;



public static function Instance() : CabinEffects {
	
	return _instance;
}

function Start () {
	shipsComputerSource = gameObject.AddComponent(AudioSource);
	loopingAudioSource = gameObject.AddComponent(AudioSource);
	loopingAudioSource.clip = redAlertLoop;
	_instance = this;
	
	clipQueue = new List.<AudioEntry>();

}

function FixedUpdate () {
	if( ! shipsComputerSource.isPlaying) {	//if nothing is playing check the queue
		if(clipQueue.Count > 0){
			//YAY THERE ARE NOISES TO MAKE
			//pop the top off the queue
			currentClip = clipQueue[0].clip;
			clipQueue.RemoveAt(0);
			
			shipsComputerSource.loop = false;
			shipsComputerSource.clip = currentClip;
			shipsComputerSource.Play();
		}
	}
		
		
		
	
}

function setAirlockLightState(state : boolean){
	var msg : OSCMessage = OSCMessage("/system/effect/airlockLight");
	msg.Append.<int>( state == true ? 1 : 0);
	OSCHandler.Instance.SendMessageToAll(msg);
	airlockLightState = state;
}


function setCabinLightingMode(state : int){
	previousLightMode = lightMode;
	lightMode = state;
	var msg : OSCMessage = OSCMessage("/system/effect/lightingMode");
	msg.Append.<int>(state);
	OSCHandler.Instance.SendMessageToAll(msg);
}

function restoreCabinLightingMode(){
	lightingMode = previousLightMode;
	var msg : OSCMessage = OSCMessage("/system/effect/lightingMode");
	msg.Append.<int>(lightingMode);
	OSCHandler.Instance.SendMessageToAll(msg);
}

function setCabinLightPower(state : boolean){
	var msg : OSCMessage = OSCMessage("/system/effect/lightingPower");
	msg.Append.<int>(state == true ? 1 : 0);
	OSCHandler.Instance.SendMessageToAll(msg);
}

/* for now just play what were passed*/
function QueueVoiceOver(audioClip : AudioClip){
	
	QueueVoiceOver(audioClip, 4);
}
function QueueVoiceOver(audioClip : AudioClip, priority : int){
//	currentClip = audioClip;
//	shipsComputerSource.Stop();
//	shipsComputerSource.loop = false;
//	shipsComputerSource.clip = currentClip;
//	shipsComputerSource.Play();

	clipQueue.Add( new AudioEntry(audioClip, priority));
	clipQueue.Sort();
	

}

/* set the red alert state
 * broadcast to clients that red alert has been engaged
 * todo:
 * .. set the red alert siren going
 * .. play a given VO over the top (to replicate the "hull breach detected" alarm that we have now"
 */
function setRedAlert(state : boolean){
	redAlert = state;
	
	var msg : OSCMessage = OSCMessage("/system/effect/redAlert");
	msg.Append.<int>(state == true ? 1 : 0);
	OSCHandler.Instance.SendMessageToAll(msg);
	if(state){
		loopingAudioSource.loop = true;
		loopingAudioSource.Play();
		setCabinLightingMode(LIGHT_REDALERT);
	} else {
		restoreCabinLightingMode();
		loopingAudioSource.Stop();
	}
}

function setRedAlertState(state : boolean, repeatClip : AudioClip){
	setRedAlert(state);
	//do looping
	
	
}

public class AudioEntry  implements IComparable.<AudioEntry>{
	public var priority : int = 0;
	public var clip : AudioClip;
	
	public function AudioEntry(clip: AudioClip, priority : int){
		this.priority = priority;
		this.clip = clip;
	}
	
	public function CompareTo(other : AudioEntry) : int {
		if(other.priority == priority){
			return 0;
		} else if (other.priority > priority){
			return -1;
		} else {
			return 1;
		}
			
	}
}