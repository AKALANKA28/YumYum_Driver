package com.akalankadias.YumYum_Driver

import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.lifecycleScope
import com.mapbox.geojson.Point
import com.mapbox.navigation.base.options.NavigationOptions
import com.mapbox.navigation.core.lifecycle.MapboxNavigationApp
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MapboxNavigationModule : Module() {
    private val activity
        get() = requireNotNull(appContext.activityProvider?.currentActivity)

    @com.mapbox.navigation.base.ExperimentalPreviewMapboxNavigationAPI
    override fun definition() = ModuleDefinition {
        Name("MapboxNavigation")

        OnActivityEntersForeground {
            (activity as LifecycleOwner).lifecycleScope.launch(Dispatchers.Main) {
                if (!MapboxNavigationApp.isSetup()) {
                    MapboxNavigationApp.setup {
                        NavigationOptions.Builder(activity.applicationContext).build()
                    }
                }
                MapboxNavigationApp.attach(activity as LifecycleOwner)
            }
        }

        OnActivityEntersBackground {
            (activity as LifecycleOwner).lifecycleScope.launch(Dispatchers.Main) {
                MapboxNavigationApp.detach(activity as LifecycleOwner)
            }
        }

        View(MapboxNavigationView::class) {
            Events(
                "onRouteProgressChanged",
                "onCancelNavigation",
                "onWaypointArrival",
                "onFinalDestinationArrival",
                "onRouteChanged",
                "onUserOffRoute",
                "onRoutesLoaded"
            )

            Prop("coordinates") { view: MapboxNavigationView, coordinates: List<Map<String, Any>> ->
                val points = mutableListOf<Point>()
                for (coordinate in coordinates) {
                    val longValue = coordinate.get("longitude")
                    val latValue = coordinate.get("latitude")
                    if (longValue is Double && latValue is Double) {
                        points.add(Point.fromLngLat(longValue, latValue))
                    }
                }
                view.setCoordinates(points)
            }

            Prop("vehicleMaxHeight") { view: MapboxNavigationView, maxHeight: Double? ->
                view.setVehicleMaxHeight(maxHeight)
            }

            Prop("vehicleMaxWidth") { view: MapboxNavigationView, maxWidth: Double? ->
                view.setVehicleMaxWidth(maxWidth)
            }

            Prop("waypointIndices") { view: MapboxNavigationView, indices: List<Int>? ->
                view.setWaypointIndices(indices)
            }

            Prop("locale") { view: MapboxNavigationView, localeStr: String? ->
                view.setLocale(localeStr)
            }

            Prop("useRouteMatchingApi") { view: MapboxNavigationView, useRouteMatchingApi: Boolean? ->
                view.setIsUsingRouteMatchingApi(useRouteMatchingApi)
            }

            Prop("routeProfile") { view: MapboxNavigationView, profile: String? ->
                view.setRouteProfile(profile)
            }

            Prop("routeExcludeList") { view: MapboxNavigationView, excludeList: List<String>? ->
                view.setRouteExcludeList(excludeList)
            }

            Prop("mapStyle") { view: MapboxNavigationView, style: String? -> view.setMapStyle(style) }

            Prop("mute") { view: MapboxNavigationView, isMuted: Boolean? -> view.setIsMuted(isMuted) }

            AsyncFunction("recenterMap") { view: MapboxNavigationView -> view.recenterMap() }
        }
    }
}