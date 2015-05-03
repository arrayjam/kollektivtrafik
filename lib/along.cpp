#include <math.h>
#include <stdio.h>

struct point
{
    double Lon;
    double Lat;
};

point
Point(double Lon, double Lat)
{
    point Point = {Lon, Lat};

    return Point;
}

double
ToRadian(double Degree)
{
    double Result = Degree * M_PI / 180;

    return Result;
}

double
ToDegree(double Radian)
{
    double Result = Radian * 180 / M_PI;

    return Result;
}

double
DistanceBetweenPoints(point PointA, point PointB)
{
    double Result = 0;

    double DeltaLat = ToRadian(PointB.Lat - PointA.Lat);
    double DeltaLon = ToRadian(PointB.Lon - PointA.Lon);
    double Lat1 = ToRadian(PointA.Lat);
    double Lat2 = ToRadian(PointB.Lat);

    double DeltaLatOver2Sin = sin(DeltaLat / 2);
    double DeltaLonOver2Sin = sin(DeltaLon / 2);

    double A = ((DeltaLatOver2Sin * DeltaLatOver2Sin) +
                (DeltaLonOver2Sin * DeltaLonOver2Sin * cos(Lat1) * cos(Lat2)));

    double C = 2 * atan2(sqrt(A), sqrt(1 - A));

    double RadianToMeters = 6371000;

    Result = RadianToMeters * C;

    return Result;
}

double
BearingBetweenPoints(point PointA, point PointB)
{
    double Lon1 = ToRadian(PointA.Lon);
    double Lon2 = ToRadian(PointB.Lon);
    double Lat1 = ToRadian(PointA.Lat);
    double Lat2 = ToRadian(PointB.Lat);

    double A = sin(Lon2 - Lon1) * cos(Lat2);
    double B = ((cos(Lat1) * sin(Lat2)) -
                (sin(Lat1) * cos(Lat2) * cos(Lon2 - Lon1)));

    double Bearing = ToDegree(atan2(A, B));

    return Bearing;
}

point
PointAlongDistanceAndBearing(point InitialPoint, double Distance, double Bearing)
{
    double Lon1 = ToRadian(InitialPoint.Lon);
    double Lat1 = ToRadian(InitialPoint.Lat);
    double BearingRad = ToRadian(Bearing);
    double R = 6371000;
    double Delta = Distance / R;

    double Lat2 = asin(sin(Lat1) * cos(Distance / R) +
                       cos(Lat1) * sin(Distance / R) * cos(BearingRad));

    double Lon2 = Lon1 + atan2(sin(BearingRad) * sin(Distance / R) * cos(Lat1),
                               cos(Distance / R) - sin(Lat1) * sin(Lat2));
    point Result = Point(ToDegree(Lon2), ToDegree(Lat2));

    return Result;
}

int
main(int argc, char **argv)
{
    point PointA = Point(39.984, -75.343);
    point PointB = Point(39.123, -75.534);

    double Distance = DistanceBetweenPoints(PointA, PointB);
    printf("Distance is: %f\n", Distance);

    double Bearing = BearingBetweenPoints(PointA, PointB);
    printf("Bearing is: %f\n", Bearing);

    point PointAlongBearing = PointAlongDistanceAndBearing(PointA, Distance, Bearing);
    printf("New point is at %f, %f\n", PointAlongBearing.Lon, PointAlongBearing.Lat);

    return 0;
}
